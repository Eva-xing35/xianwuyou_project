package services_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	miniredis "github.com/alicebob/miniredis/v2"
	"github.com/example/blindbox-backend/internal/config"
	"github.com/example/blindbox-backend/internal/middleware"
	"github.com/example/blindbox-backend/internal/models"
	"github.com/example/blindbox-backend/internal/repositories"
	"github.com/example/blindbox-backend/internal/services"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type testHarness struct {
	ctx      context.Context
	db       *gorm.DB
	repo     *repositories.Repository
	service  *services.ServiceLayer
	redisSrv *miniredis.Miniredis
}

type fakeSMS struct{}

func (fakeSMS) SendVerificationCode(ctx context.Context, phone, code string) error { return nil }

func newHarness(t *testing.T) *testHarness {
	t.Helper()

	ctx := context.Background()

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	require.NoError(t, err)

	require.NoError(t, db.AutoMigrate(&models.User{}, &models.BlindBox{}, &models.Prize{}, &models.DrawRecord{}))

	redisSrv, err := miniredis.Run()
	require.NoError(t, err)

	redisClient := redis.NewClient(&redis.Options{Addr: redisSrv.Addr()})

	repo := repositories.NewRepository(db, redisClient)

	cfg := &config.AppConfig{
		Limits: config.LimitConfig{DrawPerMinute: 100, DrawQPS: 100},
	}
	limiter := middleware.NewRedisSlidingWindow(redisClient)
	service := services.NewServiceLayer(repo, cfg, limiter, fakeSMS{}, zap.NewNop())

	return &testHarness{
		ctx:      ctx,
		db:       db,
		repo:     repo,
		service:  service,
		redisSrv: redisSrv,
	}
}

func (h *testHarness) cleanup() {
	if h.redisSrv != nil {
		h.redisSrv.Close()
	}
}

func seedBlindBox(t *testing.T, h *testHarness, userPoints int64, totalStock int64, prizeCount int64, price int64) (userID, boxID, prizeID uint) {
	t.Helper()

	phone := fmt.Sprintf("138%08d", time.Now().UnixNano()%1_0000_0000)
	user := &models.User{Phone: phone, Password: "hashed", Points: userPoints}
	require.NoError(t, h.db.Create(user).Error)

	box := &models.BlindBox{
		Name:           "\u6d4b\u8bd5\u76d2",
		CoverURL:       "/cover.png",
		Category:       "\u6d4b\u8bd5",
		Price:          price,
		TotalStock:     totalStock,
		RemainingStock: totalStock,
	}
	require.NoError(t, h.db.Create(box).Error)

	prize := &models.Prize{
		Name:           "\u6d4b\u8bd5\u5956\u54c1",
		ImageURL:       "/prize.png",
		Level:          "UR",
		Probability:    1.0,
		TotalCount:     prizeCount,
		RemainingCount: prizeCount,
		BlindBoxID:     box.ID,
	}
	require.NoError(t, h.db.Create(prize).Error)

	return user.ID, box.ID, prize.ID
}

func TestDrawReducesPointsAndStock(t *testing.T) {
	h := newHarness(t)
	t.Cleanup(h.cleanup)

	userID, boxID, _ := seedBlindBox(t, h, 1000, 5, 5, 200)

	result, prize, err := h.service.Draw(h.ctx, userID, boxID)
	require.NoError(t, err)
	require.NotNil(t, result)
	require.NotNil(t, prize)

	var user models.User
	require.NoError(t, h.db.First(&user, userID).Error)
	require.Equal(t, int64(800), user.Points)

	var box models.BlindBox
	require.NoError(t, h.db.First(&box, boxID).Error)
	require.Equal(t, int64(4), box.RemainingStock)

	var prizeModel models.Prize
	require.NoError(t, h.db.First(&prizeModel, prize.ID).Error)
	require.Equal(t, int64(4), prizeModel.RemainingCount)
}

func TestDrawFailsWhenPointsInsufficient(t *testing.T) {
	h := newHarness(t)
	t.Cleanup(h.cleanup)

	userID, boxID, _ := seedBlindBox(t, h, 100, 5, 5, 200)

	_, _, err := h.service.Draw(h.ctx, userID, boxID)
	require.ErrorIs(t, err, services.ErrInsufficientPoints)
}

func TestDrawFailsWhenStockDepleted(t *testing.T) {
	h := newHarness(t)
	t.Cleanup(h.cleanup)

	userID, boxID, _ := seedBlindBox(t, h, 1000, 1, 1, 200)

	_, _, err := h.service.Draw(h.ctx, userID, boxID)
	require.NoError(t, err)

	// Second draw should fail due to zero stock
	_, _, err = h.service.Draw(h.ctx, userID, boxID)
	require.Error(t, err)
}

func TestMarkRedeemedUpdatesStatus(t *testing.T) {
	h := newHarness(t)
	t.Cleanup(h.cleanup)

	userID, boxID, _ := seedBlindBox(t, h, 1000, 1, 1, 200)

	record, prize, err := h.service.Draw(h.ctx, userID, boxID)
	require.NoError(t, err)
	require.NotNil(t, record)
	require.NotNil(t, prize)

	err = h.service.Redeem(h.ctx, userID, record.ID, "\u4e0a\u6d77\u5e02\u9ec4\u6d66\u533a\u6d4b\u8bd5\u8def1\u53f7")
	require.NoError(t, err)

	var stored models.DrawRecord
	require.NoError(t, h.db.First(&stored, record.ID).Error)
	require.Equal(t, "\u5df2\u5151\u6362", stored.Status)
	require.NotEmpty(t, stored.TrackingNo)
}

func TestRateLimiterAllowsRapidSequentialDrawsWithinLimit(t *testing.T) {
	h := newHarness(t)
	t.Cleanup(h.cleanup)

	userID, boxID, _ := seedBlindBox(t, h, 1000, 10, 10, 50)

	for i := 0; i < 5; i++ {
		_, _, err := h.service.Draw(h.ctx, userID, boxID)
		require.NoError(t, err)
	}

	// Wait for limiter window to reset
	time.Sleep(1100 * time.Millisecond)

	_, _, err := h.service.Draw(h.ctx, userID, boxID)
	require.NoError(t, err)
}

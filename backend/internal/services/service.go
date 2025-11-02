package services

import (
    "context"
    "crypto/rand"
    "encoding/base64"
    "errors"
    "fmt"
    "math"
    "math/big"
    "time"

    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/models"
    "github.com/example/blindbox-backend/internal/repositories"
    "github.com/example/blindbox-backend/internal/utils"
    "github.com/redis/go-redis/v9"
    "gorm.io/gorm"
)

var (
    ErrInvalidCredentials = errors.New("invalid credentials")
    ErrInsufficientPoints = errors.New("insufficient points")
)

type ServiceLayer struct {
    repo    *repositories.Repository
    cfg     *config.AppConfig
    limiter RateLimiter
}

type RateLimiter interface {
    Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error)
}

func NewServiceLayer(repo *repositories.Repository, cfg *config.AppConfig, limiter RateLimiter) *ServiceLayer {
    return &ServiceLayer{repo: repo, cfg: cfg, limiter: limiter}
}

func (s *ServiceLayer) Register(ctx context.Context, phone, password string) (*models.User, error) {
    hash, err := utils.HashPassword(password)
    if err != nil {
        return nil, err
    }
    user := &models.User{Phone: phone, Password: hash, Points: 0}
    if err := s.repo.CreateUser(ctx, user); err != nil {
        return nil, err
    }
    return user, nil
}

func (s *ServiceLayer) SendSMSCode(ctx context.Context, phone string) (string, error) {
    buf := make([]byte, 3)
    if _, err := rand.Read(buf); err != nil {
        return "", err
    }
    code := fmt.Sprintf("%06d", int(buf[0])%1000000)
    return code, s.repo.SaveSMSCode(ctx, phone, code, s.cfg.Auth.VerificationTTL)
}

func (s *ServiceLayer) Login(ctx context.Context, phone, password, code string) (*models.User, string, error) {
    user, err := s.repo.GetUserByPhone(ctx, phone)
    if err != nil {
        if errors.Is(err, repositories.ErrNotFound) {
            return nil, "", ErrInvalidCredentials
        }
        return nil, "", err
    }

    if code != "" {
        ok, err := s.repo.VerifySMSCode(ctx, phone, code)
        if err != nil || !ok {
            return nil, "", ErrInvalidCredentials
        }
    } else {
        if err := utils.ComparePassword(user.Password, password); err != nil {
            return nil, "", ErrInvalidCredentials
        }
    }

    token, err := utils.GenerateJWT(user.ID, s.cfg.Auth.JWTSecret, s.cfg.Auth.AccessTokenTTL)
    if err != nil {
        return nil, "", err
    }
    return user, token, nil
}

func (s *ServiceLayer) Profile(ctx context.Context, userID uint) (*models.User, []models.DrawRecord, error) {
    user, err := s.repo.GetUserByID(ctx, userID)
    if err != nil {
        return nil, nil, err
    }
    records, err := s.repo.GetUserPrizes(ctx, userID)
    return user, records, err
}

func (s *ServiceLayer) ListBlindBoxes(ctx context.Context, category string, page, size int) ([]models.BlindBox, int64, error) {
    if size <= 0 {
        size = 10
    }
    if size > 50 {
        size = 50
    }
    if page <= 0 {
        page = 1
    }
    offset := (page - 1) * size
    return s.repo.ListBlindBoxes(ctx, category, size, offset)
}

func (s *ServiceLayer) GetBlindBoxDetail(ctx context.Context, id uint) (*models.BlindBox, error) {
    return s.repo.GetBlindBoxWithPrizes(ctx, id)
}

func (s *ServiceLayer) Draw(ctx context.Context, userID, boxID uint) (*models.DrawRecord, *models.Prize, error) {
    limiterKey := fmt.Sprintf("draw:minute:%d", userID)
    allowed, err := s.limiter.Allow(ctx, limiterKey, s.cfg.Limits.DrawPerMinute, time.Minute)
    if err != nil {
        return nil, nil, err
    }
    if !allowed {
        return nil, nil, fmt.Errorf("rate limit: exceeded draws per minute")
    }

    box, err := s.repo.GetBlindBoxWithPrizes(ctx, boxID)
    if err != nil {
        return nil, nil, err
    }

    lockKey := fmt.Sprintf("lock:user:%d", userID)
    ok, err := s.repo.AcquireLock(ctx, lockKey, 5*time.Second)
    if err != nil {
        return nil, nil, err
    }
    if !ok {
        return nil, nil, fmt.Errorf("retry: user busy")
    }
    defer s.repo.ReleaseLock(ctx, lockKey)

    user, err := s.repo.GetUserByID(ctx, userID)
    if err != nil {
        return nil, nil, err
    }

    if user.Points < box.Price {
        return nil, nil, ErrInsufficientPoints
    }

    prize, err := weightedRandom(box.Prizes)
    if err != nil {
        return nil, nil, err
    }

    record := &models.DrawRecord{
        UserID:     userID,
        BlindBoxID: boxID,
        PrizeID:    prize.ID,
        DrawTime:   time.Now(),
        Status:     "\u672a\u5151\u6362",
    }

    err = s.repo.WithTransaction(ctx, func(tx *gorm.DB) error {
        if err := s.repo.UpdateBlindBoxStock(tx, boxID, -1); err != nil {
            return err
        }
        if err := s.repo.UpdatePrizeStock(tx, prize.ID, -1); err != nil {
            return err
        }
        res := tx.Model(&models.User{}).
            Where("id = ? AND points >= ?", userID, box.Price).
            UpdateColumn("points", gorm.Expr("points - ?", box.Price))
        if res.Error != nil {
            return res.Error
        }
        if res.RowsAffected == 0 {
            return ErrInsufficientPoints
        }
        if err := s.repo.CreateDrawRecord(tx, record); err != nil {
            return err
        }
        return nil
    })
    if err != nil {
        return nil, nil, err
    }

    return record, prize, nil
}

func (s *ServiceLayer) Redeem(ctx context.Context, userID, recordID uint, address string) error {
    tracking := fakeTrackingNo()
    return s.repo.MarkRedeemed(ctx, userID, recordID, address, tracking)
}

func weightedRandom(prizes []models.Prize) (*models.Prize, error) {
    if len(prizes) == 0 {
        return nil, errors.New("empty prize pool")
    }
    var total float64
    for _, p := range prizes {
        total += p.Probability
    }
    if total <= 0 {
        return nil, errors.New("invalid probability sum")
    }
    rnd, err := randFloat64()
    if err != nil {
        return nil, err
    }
    cumulative := 0.0
    for i := range prizes {
        cumulative += prizes[i].Probability / total
        if rnd <= cumulative {
            return &prizes[i], nil
        }
    }
    return &prizes[len(prizes)-1], nil
}

func randFloat64() (float64, error) {
    n, err := rand.Int(rand.Reader, big.NewInt(math.MaxInt64))
    if err != nil {
        return 0, err
    }
    return float64(n.Int64()) / float64(math.MaxInt64), nil
}

func fakeTrackingNo() string {
    buf := make([]byte, 8)
    rand.Read(buf)
    return "LX" + base64.RawURLEncoding.EncodeToString(buf)
}

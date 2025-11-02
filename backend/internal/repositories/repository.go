package repositories

import (
    "context"
    "errors"
    "time"

    "github.com/example/blindbox-backend/internal/models"
    "github.com/redis/go-redis/v9"
    "gorm.io/gorm"
)

var (
    ErrNotFound        = gorm.ErrRecordNotFound
    ErrInsufficient    = errors.New("insufficient stock")
)

type Repository struct {
    db    *gorm.DB
    redis *redis.Client
}

func NewRepository(db *gorm.DB, redis *redis.Client) *Repository {
    return &Repository{db: db, redis: redis}
}

func (r *Repository) DB() *gorm.DB { return r.db }
func (r *Repository) Redis() *redis.Client { return r.redis }

func (r *Repository) CreateUser(ctx context.Context, user *models.User) error {
    return r.db.WithContext(ctx).Create(user).Error
}

func (r *Repository) GetUserByPhone(ctx context.Context, phone string) (*models.User, error) {
    var user models.User
    if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&user).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uint) (*models.User, error) {
    var user models.User
    if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
        return nil, err
    }
    return &user, nil
}

func (r *Repository) UpdateUserPoints(ctx context.Context, id uint, delta int64) error {
    return r.db.WithContext(ctx).Model(&models.User{}).Where("id = ?", id).
        UpdateColumn("points", gorm.Expr("points + ?", delta)).Error
}

func (r *Repository) ListBlindBoxes(ctx context.Context, category string, limit, offset int) ([]models.BlindBox, int64, error) {
    var boxes []models.BlindBox
    query := r.db.WithContext(ctx).Model(&models.BlindBox{})
    if category != "" {
        query = query.Where("category = ?", category)
    }
    var total int64
    if err := query.Count(&total).Error; err != nil {
        return nil, 0, err
    }
    if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&boxes).Error; err != nil {
        return nil, 0, err
    }
    return boxes, total, nil
}

func (r *Repository) GetBlindBoxWithPrizes(ctx context.Context, id uint) (*models.BlindBox, error) {
    var box models.BlindBox
    if err := r.db.WithContext(ctx).Preload("Prizes").First(&box, id).Error; err != nil {
        return nil, err
    }
    return &box, nil
}

func (r *Repository) UpdateBlindBoxStock(tx *gorm.DB, id uint, delta int64) error {
    res := tx.Model(&models.BlindBox{}).
        Where("id = ? AND remaining_stock + ? >= 0", id, delta).
        UpdateColumn("remaining_stock", gorm.Expr("remaining_stock + ?", delta))
    if res.Error != nil {
        return res.Error
    }
    if res.RowsAffected == 0 {
        return ErrInsufficient
    }
    return nil
}

func (r *Repository) UpdatePrizeStock(tx *gorm.DB, id uint, delta int64) error {
    res := tx.Model(&models.Prize{}).
        Where("id = ? AND remaining_count + ? >= 0", id, delta).
        UpdateColumn("remaining_count", gorm.Expr("remaining_count + ?", delta))
    if res.Error != nil {
        return res.Error
    }
    if res.RowsAffected == 0 {
        return ErrInsufficient
    }
    return nil
}

func (r *Repository) CreateDrawRecord(tx *gorm.DB, record *models.DrawRecord) error {
    return tx.Create(record).Error
}

func (r *Repository) GetUserPrizes(ctx context.Context, userID uint) ([]models.DrawRecord, error) {
    var records []models.DrawRecord
    err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("draw_time DESC").Find(&records).Error
    return records, err
}

func (r *Repository) MarkRedeemed(ctx context.Context, userID, recordID uint, address, tracking string) error {
    res := r.db.WithContext(ctx).Model(&models.DrawRecord{}).
        Where("id = ? AND user_id = ? AND status = ?", recordID, userID, "\u672a\u5151\u6362").
        Updates(map[string]any{
            "status":      "\u5df2\u5151\u6362",
            "address":     address,
            "tracking_no": tracking,
        })
    if res.Error != nil {
        return res.Error
    }
    if res.RowsAffected == 0 {
        return errors.New("record not redeemable")
    }
    return nil
}

func (r *Repository) WithTransaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
    return r.db.WithContext(ctx).Transaction(fn)
}

func (r *Repository) SaveSMSCode(ctx context.Context, phone, code string, ttl time.Duration) error {
    return r.redis.Set(ctx, smsKey(phone), code, ttl).Err()
}

func (r *Repository) VerifySMSCode(ctx context.Context, phone, code string) (bool, error) {
    val, err := r.redis.Get(ctx, smsKey(phone)).Result()
    if err != nil {
        if errors.Is(err, redis.Nil) {
            return false, nil
        }
        return false, err
    }
    return val == code, nil
}

func smsKey(phone string) string { return "sms:" + phone }

func (r *Repository) AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
    return r.redis.SetNX(ctx, key, time.Now().UnixNano(), ttl).Result()
}

func (r *Repository) ReleaseLock(ctx context.Context, key string) error {
    return r.redis.Del(ctx, key).Err()
}

package repositories

import (
    "time"

    "github.com/example/blindbox-backend/internal/config"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

func NewMySQL(cfg config.DatabaseConfig) (*gorm.DB, error) {
    db, err := gorm.Open(mysql.Open(cfg.DSN), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Warn),
    })
    if err != nil {
        return nil, err
    }

    sqlDB, err := db.DB()
    if err != nil {
        return nil, err
    }
    sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
    sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
    sqlDB.SetConnMaxIdleTime(time.Duration(cfg.ConnMaxIdleSec) * time.Second)
    sqlDB.SetConnMaxLifetime(time.Duration(cfg.ConnMaxLifeSec) * time.Second)

    return db, nil
}

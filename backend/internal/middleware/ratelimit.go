package middleware

import (
    "context"
    "fmt"
    "net/http"
    "time"

    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/utils"
    "github.com/gin-gonic/gin"
    "github.com/redis/go-redis/v9"
)

type SlidingWindowLimiter struct {
    redis *redis.Client
}

func NewRedisSlidingWindow(client *redis.Client) *SlidingWindowLimiter {
    return &SlidingWindowLimiter{redis: client}
}

func (l *SlidingWindowLimiter) Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
    now := time.Now().UnixNano()
    pipeline := l.redis.TxPipeline()
    windowStart := now - window.Nanoseconds()
    pipeline.ZAdd(ctx, key, redis.Z{Score: float64(now), Member: now})
    pipeline.ZRemRangeByScore(ctx, key, "-inf", fmt.Sprintf("%d", windowStart))
    count := pipeline.ZCard(ctx, key)
    pipeline.Expire(ctx, key, window)
    if _, err := pipeline.Exec(ctx); err != nil {
        return false, err
    }
    current, err := count.Result()
    if err != nil {
        return false, err
    }
    return current <= int64(limit), nil
}

func DrawRateLimit(cfg *config.AppConfig) gin.HandlerFunc {
    return func(c *gin.Context) {
        limiter, ok := c.MustGet("limiter").(*SlidingWindowLimiter)
        if !ok {
            utils.RespondError(c, http.StatusInternalServerError, 1999, "limiter missing")
            return
        }
        ctx := c.Request.Context()
        userID := c.GetUint("userID")
        userKey := fmt.Sprintf("draw:qps:user:%d", userID)
        globalKey := "draw:qps:global"

        if ok, err := limiter.Allow(ctx, globalKey, cfg.Limits.DrawQPS, time.Second); err != nil {
            utils.RespondError(c, http.StatusInternalServerError, 1998, "limiter error")
            return
        } else if !ok {
            utils.RespondError(c, http.StatusTooManyRequests, 1201, "too many draw requests")
            return
        }

        if ok, err := limiter.Allow(ctx, userKey, cfg.Limits.DrawQPS, time.Second); err != nil {
            utils.RespondError(c, http.StatusInternalServerError, 1998, "limiter error")
            return
        } else if !ok {
            utils.RespondError(c, http.StatusTooManyRequests, 1202, "user draw rate limited")
            return
        }
        c.Next()
    }
}

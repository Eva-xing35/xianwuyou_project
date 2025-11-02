package server

import (
    "log"

    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/controllers"
    "github.com/example/blindbox-backend/internal/middleware"
    "github.com/example/blindbox-backend/internal/repositories"
    "github.com/example/blindbox-backend/internal/services"
)

type Handler struct {
    User     *controllers.UserController
    BlindBox *controllers.BlindBoxController
    Draw     *controllers.DrawController
    Order    *controllers.OrderController
    Limiter  *middleware.SlidingWindowLimiter
}

func NewHandler(cfg *config.AppConfig) *Handler {
    db, err := repositories.NewMySQL(cfg.Database)
    if err != nil {
        log.Fatalf("failed to connect mysql: %v", err)
    }

    redisClient := repositories.NewRedis(cfg.Redis)

    limiter := middleware.NewRedisSlidingWindow(redisClient)

    repo := repositories.NewRepository(db, redisClient)
    svc := services.NewServiceLayer(repo, cfg, limiter)

    return &Handler{
        User:     controllers.NewUserController(svc, cfg),
        BlindBox: controllers.NewBlindBoxController(svc),
        Draw:     controllers.NewDrawController(svc),
        Order:    controllers.NewOrderController(svc),
        Limiter:  limiter,
    }
}

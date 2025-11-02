package router

import (
    "net/http"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/middleware"
    "github.com/example/blindbox-backend/internal/server"
)

func NewServer(cfg *config.AppConfig) *gin.Engine {
    gin.SetMode(gin.ReleaseMode)
    r := gin.New()
    r.Use(gin.Recovery())
    r.Use(cors.New(cors.Config{
        AllowOrigins: []string{"*"},
        AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE"},
        AllowHeaders: []string{"Authorization", "Content-Type"},
        MaxAge:       12 * time.Hour,
    }))

    handler := server.NewHandler(cfg)

    r.Use(func(c *gin.Context) {
        c.Set("limiter", handler.Limiter)
        c.Next()
    })

    api := r.Group("/api/v1")
    {
        api.POST("/auth/register", handler.User.Register)
        api.POST("/auth/login", handler.User.Login)
        api.POST("/auth/send-code", handler.User.SendVerificationCode)

        api.GET("/blind-boxes", handler.BlindBox.List)
        api.GET("/blind-boxes/:id", handler.BlindBox.Detail)

        authRequired := api.Group("")
        authRequired.Use(middleware.JWTAuth(cfg.Auth.JWTSecret))
        {
            authRequired.GET("/profile", handler.User.Profile)
            authRequired.POST("/draw", middleware.DrawRateLimit(cfg), handler.Draw.Draw)
            authRequired.POST("/redeem", handler.Order.Redeem)
        }
    }

    r.GET("/healthz", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })

    return r
}

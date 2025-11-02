package main

import (
    "log"

    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/router"
)

func main() {
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("failed to load config: %v", err)
    }

    engine := router.NewServer(cfg)

    if err := engine.Run(cfg.Server.Address()); err != nil {
        log.Fatalf("server stopped with error: %v", err)
    }
}

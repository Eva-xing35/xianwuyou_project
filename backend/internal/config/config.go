package config

import (
    "fmt"
    "time"

    "github.com/caarlos0/env/v9"
)

type AppConfig struct {
    Server   ServerConfig   `envPrefix:"SERVER_"`
    Database DatabaseConfig `envPrefix:"DB_"`
    Redis    RedisConfig    `envPrefix:"REDIS_"`
    Auth     AuthConfig     `envPrefix:"AUTH_"`
    Limits   LimitConfig    `envPrefix:"LIMIT_"`
    SMS      SMSConfig      `envPrefix:"SMS_"`
    Logging  LoggingConfig  `envPrefix:"LOG_"`
}

type ServerConfig struct {
    Host string `env:"HOST" envDefault:"0.0.0.0"`
    Port int    `env:"PORT" envDefault:"8080"`
}

func (s ServerConfig) Address() string {
    return fmt.Sprintf("%s:%d", s.Host, s.Port)
}

type DatabaseConfig struct {
    DSN            string `env:"DSN,required"`
    MaxIdleConns   int    `env:"MAX_IDLE_CONNS" envDefault:"10"`
    MaxOpenConns   int    `env:"MAX_OPEN_CONNS" envDefault:"25"`
    ConnMaxIdleSec int    `env:"CONN_MAX_IDLE_SEC" envDefault:"300"`
    ConnMaxLifeSec int    `env:"CONN_MAX_LIFE_SEC" envDefault:"900"`
}

type RedisConfig struct {
    Addr     string `env:"ADDR,required"`
    Password string `env:"PASSWORD"`
    DB       int    `env:"DB" envDefault:"0"`
}

type AuthConfig struct {
    JWTSecret        string        `env:"JWT_SECRET,required"`
    AccessTokenTTL   time.Duration `env:"ACCESS_TOKEN_TTL" envDefault:"2h"`
    VerificationTTL  time.Duration `env:"VERIFICATION_TTL" envDefault:"5m"`
}

type LimitConfig struct {
    DrawPerMinute int `env:"DRAW_PER_MINUTE" envDefault:"10"`
    DrawQPS       int `env:"DRAW_QPS" envDefault:"100"`
}

type SMSConfig struct {
    Provider   string        `env:"PROVIDER" envDefault:"mock"`
    Endpoint   string        `env:"ENDPOINT"`
    APIKey     string        `env:"API_KEY"`
    APISecret  string        `env:"API_SECRET"`
    SignName   string        `env:"SIGN_NAME"`
    TemplateID string        `env:"TEMPLATE_ID"`
    Timeout    time.Duration `env:"TIMEOUT" envDefault:"3s"`
}

type LoggingConfig struct {
    Level string `env:"LEVEL" envDefault:"info"`
}

func Load() (*AppConfig, error) {
    cfg := &AppConfig{}
    if err := env.Parse(cfg); err != nil {
        return nil, err
    }
    return cfg, nil
}

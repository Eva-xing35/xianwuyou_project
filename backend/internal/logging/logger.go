package logging

import (
	"strings"

	"github.com/example/blindbox-backend/internal/config"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func New(cfg config.LoggingConfig) (*zap.Logger, error) {
	logCfg := zap.NewProductionConfig()
	level := strings.ToLower(cfg.Level)
	if level == "" {
		level = "info"
	}
	if err := logCfg.Level.UnmarshalText([]byte(level)); err != nil {
		logCfg.Level = zap.NewAtomicLevelAt(zapcore.InfoLevel)
	}
	logCfg.EncoderConfig.TimeKey = "timestamp"
	logCfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	return logCfg.Build()
}

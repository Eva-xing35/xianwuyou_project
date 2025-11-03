package sms

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/example/blindbox-backend/internal/config"
)

type Provider interface {
	SendVerificationCode(ctx context.Context, phone, code string) error
}

type noopProvider struct{}

func (noopProvider) SendVerificationCode(_ context.Context, _ string, _ string) error {
	return nil
}

type HTTPGateway struct {
	client     *http.Client
	endpoint   string
	provider   string
	apiKey     string
	apiSecret  string
	signName   string
	templateID string
	timeout    time.Duration
}

func NewProvider(cfg config.SMSConfig) Provider {
	if cfg.Endpoint == "" {
		return noopProvider{}
	}
	timeout := cfg.Timeout
	if timeout == 0 {
		timeout = 3 * time.Second
	}
	return &HTTPGateway{
		client:     &http.Client{Timeout: timeout},
		endpoint:   cfg.Endpoint,
		provider:   cfg.Provider,
		apiKey:     cfg.APIKey,
		apiSecret:  cfg.APISecret,
		signName:   cfg.SignName,
		templateID: cfg.TemplateID,
		timeout:    timeout,
	}
}

func (h *HTTPGateway) SendVerificationCode(ctx context.Context, phone, code string) error {
	payload := map[string]any{
		"phone":      phone,
		"code":       code,
		"signName":   h.signName,
		"templateId": h.templateID,
		"provider":   h.provider,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("sms: marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, h.endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("sms: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if h.apiKey != "" {
		req.Header.Set("X-API-KEY", h.apiKey)
	}
	if h.apiSecret != "" {
		req.Header.Set("X-API-SECRET", h.apiSecret)
	}

	resp, err := h.client.Do(req)
	if err != nil {
		return fmt.Errorf("sms: execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("sms: provider returned status %d", resp.StatusCode)
	}

	return nil
}

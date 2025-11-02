# Blind Box Backend Service

Go 1.22 + Gin + GORM + MySQL + Redis backend supporting the blind box mini-program. Includes JWT auth, distributed locking, Redis-based rate limiting, and Docker support.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DB_DSN` | MySQL DSN (e.g. `user:pass@tcp(mysql:3306)/blindbox?parseTime=true&loc=Local`) |
| `REDIS_ADDR` | Redis address (e.g. `redis:6379`) |
| `REDIS_PASSWORD` | Redis password (optional) |
| `REDIS_DB` | Redis DB index |
| `AUTH_JWT_SECRET` | Secret key for JWT signing |
| `AUTH_ACCESS_TOKEN_TTL` | Access token TTL (default `2h`) |
| `AUTH_VERIFICATION_TTL` | SMS code TTL (default `5m`) |
| `LIMIT_DRAW_PER_MINUTE` | Per-user draw limit per minute (default `10`) |
| `LIMIT_DRAW_QPS` | Draw QPS limit for global/user windows (default `100`) |

## Run locally

```bash
cd backend
go run ./cmd/server
```

Ensure MySQL and Redis are reachable per the DSN/env above. Initial schema provided in `database/migrations/001_init.sql`.

## Docker

```bash
docker build -t blindbox-backend .
docker run -p 8080:8080 --env-file .env blindbox-backend
```

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Register with phone/password |
| `POST` | `/api/v1/auth/send-code` | Send login verification code (mock) |
| `POST` | `/api/v1/auth/login` | Login via password or code |
| `GET` | `/api/v1/blind-boxes` | List blind boxes with pagination |
| `GET` | `/api/v1/blind-boxes/:id` | Blind box detail with prize pool |
| `GET` | `/api/v1/profile` | User profile + draw history (JWT required) |
| `POST` | `/api/v1/draw` | Draw blind box (JWT, rate limited, distributed lock) |
| `POST` | `/api/v1/redeem` | Redeem prize and generate tracking no |

Error responses follow `{ "code": <int>, "msg": "..." }` format.

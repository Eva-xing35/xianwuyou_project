# syntax=docker/dockerfile:1

FROM golang:1.22 AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o blindbox ./cmd/server

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/blindbox ./blindbox
COPY database ./database

ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["/app/blindbox"]

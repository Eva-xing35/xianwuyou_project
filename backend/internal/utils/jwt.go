package utils

import (
    "time"

    "github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID uint, secret string, ttl time.Duration) (string, error) {
    claims := jwt.MapClaims{
        "sub": userID,
        "exp": time.Now().Add(ttl).Unix(),
        "iat": time.Now().Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

func ParseJWT(tokenStr, secret string) (uint, error) {
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, jwt.ErrTokenInvalidClaims
        }
        return []byte(secret), nil
    })
    if err != nil {
        return 0, err
    }
    if !token.Valid {
        return 0, jwt.ErrTokenInvalidClaims
    }
    if claims, ok := token.Claims.(jwt.MapClaims); ok {
        if sub, ok := claims["sub"].(float64); ok {
            return uint(sub), nil
        }
    }
    return 0, jwt.ErrTokenInvalidClaims
}

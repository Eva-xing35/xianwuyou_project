package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/utils"
)

func JWTAuth(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
            utils.RespondError(c, http.StatusUnauthorized, 1000, "missing token")
            return
        }
        userID, err := utils.ParseJWT(parts[1], secret)
        if err != nil {
            utils.RespondError(c, http.StatusUnauthorized, 1001, "invalid token")
            return
        }
        c.Set("userID", userID)
        c.Next()
    }
}

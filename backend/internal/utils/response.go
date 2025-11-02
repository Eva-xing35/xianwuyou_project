package utils

import "github.com/gin-gonic/gin"

type APIError struct {
    Code int    `json:"code"`
    Msg  string `json:"msg"`
}

func RespondError(c *gin.Context, status int, code int, msg string) {
    c.AbortWithStatusJSON(status, APIError{Code: code, Msg: msg})
}

func RespondOK(c *gin.Context, payload any) {
    c.JSON(200, gin.H{"code": 0, "data": payload})
}

package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/config"
    "github.com/example/blindbox-backend/internal/services"
    "github.com/example/blindbox-backend/internal/utils"
)

type UserController struct {
    service *services.ServiceLayer
    cfg     *config.AppConfig
}

func NewUserController(svc *services.ServiceLayer, cfg *config.AppConfig) *UserController {
    return &UserController{service: svc, cfg: cfg}
}

type registerRequest struct {
    Phone    string `json:"phone" binding:"required"`
    Password string `json:"password" binding:"required,min=6"`
}

func (uc *UserController) Register(c *gin.Context) {
    var req registerRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 1002, err.Error())
        return
    }
    user, err := uc.service.Register(c.Request.Context(), req.Phone, req.Password)
    if err != nil {
        utils.RespondError(c, http.StatusBadRequest, 1003, err.Error())
        return
    }
    utils.RespondOK(c, gin.H{"user": user})
}

type loginRequest struct {
    Phone    string `json:"phone" binding:"required"`
    Password string `json:"password"`
    Code     string `json:"code"`
}

func (uc *UserController) Login(c *gin.Context) {
    var req loginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 1002, err.Error())
        return
    }
    user, token, err := uc.service.Login(c.Request.Context(), req.Phone, req.Password, req.Code)
    if err != nil {
        utils.RespondError(c, http.StatusUnauthorized, 1004, err.Error())
        return
    }
    utils.RespondOK(c, gin.H{"token": token, "user": user})
}

type smsRequest struct {
    Phone string `json:"phone" binding:"required"`
}

func (uc *UserController) SendVerificationCode(c *gin.Context) {
    var req smsRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 1002, err.Error())
        return
    }
    code, err := uc.service.SendSMSCode(c.Request.Context(), req.Phone)
    if err != nil {
        utils.RespondError(c, http.StatusInternalServerError, 1005, err.Error())
        return
    }
    // For demo purposes return code; production should integrate SMS provider.
    utils.RespondOK(c, gin.H{"code": code})
}

func (uc *UserController) Profile(c *gin.Context) {
    userID := c.GetUint("userID")
    user, records, err := uc.service.Profile(c.Request.Context(), userID)
    if err != nil {
        utils.RespondError(c, http.StatusInternalServerError, 1006, err.Error())
        return
    }
    utils.RespondOK(c, gin.H{"user": user, "records": records})
}

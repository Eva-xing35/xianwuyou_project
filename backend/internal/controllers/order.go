package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/services"
    "github.com/example/blindbox-backend/internal/utils"
)

type OrderController struct {
    service *services.ServiceLayer
}

func NewOrderController(svc *services.ServiceLayer) *OrderController {
    return &OrderController{service: svc}
}

type redeemRequest struct {
    RecordID uint   `json:"record_id" binding:"required"`
    Address  string `json:"address" binding:"required"`
}

func (oc *OrderController) Redeem(c *gin.Context) {
    var req redeemRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 4001, err.Error())
        return
    }
    userID := c.GetUint("userID")
    if err := oc.service.Redeem(c.Request.Context(), userID, req.RecordID, req.Address); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 4002, err.Error())
        return
    }
    utils.RespondOK(c, gin.H{"status": "ok"})
}

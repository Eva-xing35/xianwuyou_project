package controllers

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/services"
    "github.com/example/blindbox-backend/internal/utils"
)

type DrawController struct {
    service *services.ServiceLayer
}

func NewDrawController(svc *services.ServiceLayer) *DrawController {
    return &DrawController{service: svc}
}

type drawRequest struct {
    BlindBoxID uint `json:"blind_box_id" binding:"required"`
}

func (dc *DrawController) Draw(c *gin.Context) {
    var req drawRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.RespondError(c, http.StatusBadRequest, 3001, err.Error())
        return
    }
    userID := c.GetUint("userID")
    record, prize, err := dc.service.Draw(c.Request.Context(), userID, req.BlindBoxID)
    if err != nil {
        switch err {
        case services.ErrInsufficientPoints:
            utils.RespondError(c, http.StatusBadRequest, 3002, "积分不足")
        default:
            utils.RespondError(c, http.StatusBadRequest, 3003, err.Error())
        }
        return
    }
    utils.RespondOK(c, gin.H{"record": record, "prize": prize})
}

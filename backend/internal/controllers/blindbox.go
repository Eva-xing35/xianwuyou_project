package controllers

import (
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
    "github.com/example/blindbox-backend/internal/services"
    "github.com/example/blindbox-backend/internal/utils"
)

type BlindBoxController struct {
    service *services.ServiceLayer
}

func NewBlindBoxController(svc *services.ServiceLayer) *BlindBoxController {
    return &BlindBoxController{service: svc}
}

func (bc *BlindBoxController) List(c *gin.Context) {
    category := c.Query("category")
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
    boxes, total, err := bc.service.ListBlindBoxes(c.Request.Context(), category, page, size)
    if err != nil {
        utils.RespondError(c, http.StatusInternalServerError, 2001, err.Error())
        return
    }
    utils.RespondOK(c, gin.H{"list": boxes, "total": total})
}

func (bc *BlindBoxController) Detail(c *gin.Context) {
    idParam := c.Param("id")
    id64, err := strconv.ParseUint(idParam, 10, 64)
    if err != nil {
        utils.RespondError(c, http.StatusBadRequest, 2002, "invalid id")
        return
    }
    box, err := bc.service.GetBlindBoxDetail(c.Request.Context(), uint(id64))
    if err != nil {
        utils.RespondError(c, http.StatusNotFound, 2003, err.Error())
        return
    }
    utils.RespondOK(c, box)
}

package models

import "time"

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Phone     string    `gorm:"uniqueIndex;size:20" json:"phone"`
    Password  string    `gorm:"size:255" json:"-"`
    Points    int64     `gorm:"not null;default:0" json:"points"`
    CreatedAt time.Time `json:"created_at"`
}

type BlindBox struct {
    ID             uint      `gorm:"primaryKey" json:"id"`
    Name           string    `gorm:"size:128" json:"name"`
    CoverURL       string    `gorm:"size:255" json:"cover_url"`
    Category       string    `gorm:"size:64;index" json:"category"`
    Price          int64     `gorm:"not null" json:"price"`
    TotalStock     int64     `gorm:"not null" json:"total_stock"`
    RemainingStock int64     `gorm:"not null" json:"remaining_stock"`
    CreatedAt      time.Time `json:"created_at"`
    Prizes         []Prize   `json:"prizes"`
}

type Prize struct {
    ID              uint      `gorm:"primaryKey" json:"id"`
    Name            string    `gorm:"size:128" json:"name"`
    ImageURL        string    `gorm:"size:255" json:"image_url"`
    Level           string    `gorm:"size:8" json:"level"`
    Probability     float64   `gorm:"type:decimal(6,4)" json:"probability"`
    TotalCount      int64     `gorm:"not null" json:"total_count"`
    RemainingCount  int64     `gorm:"not null" json:"remaining_count"`
    BlindBoxID      uint      `gorm:"index" json:"blind_box_id"`
    CreatedAt       time.Time `json:"created_at"`
}

type DrawRecord struct {
    ID         uint      `gorm:"primaryKey" json:"id"`
    UserID     uint      `gorm:"index" json:"user_id"`
    BlindBoxID uint      `gorm:"index" json:"blind_box_id"`
    PrizeID    uint      `gorm:"index" json:"prize_id"`
    DrawTime   time.Time `gorm:"autoCreateTime" json:"draw_time"`
    Status     string    `gorm:"size:16" json:"status"`
    Address    string    `gorm:"size:255" json:"address,omitempty"`
    TrackingNo string    `gorm:"size:64" json:"tracking_no,omitempty"`
    Prize      Prize     `gorm:"foreignKey:PrizeID" json:"prize,omitempty"`
}

func (BlindBox) TableName() string { return "blind_boxes" }
func (Prize) TableName() string { return "prizes" }
func (DrawRecord) TableName() string { return "draw_records" }

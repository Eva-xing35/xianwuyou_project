const earningsService = require("../../services/earningsService");
const { formatCurrency, formatDate } = require("../../utils/format");

Page({
  data: {
    summary: {
      todayIncome: "0.00",
      todayOrders: 0,
      pendingWithdraw: "0.00",
      lastSettlement: "-"
    },
    loading: false
  },

  onLoad() {
    this.loadSummary();
  },

  onPullDownRefresh() {
    this.loadSummary().finally(() => wx.stopPullDownRefresh());
  },

  async loadSummary() {
    this.setData({ loading: true });
    try {
      const result = await earningsService.fetchTodaySummary();
      this.setData({
        summary: {
          todayIncome: formatCurrency(result.todayIncome),
          todayOrders: result.todayOrders ?? 0,
          pendingWithdraw: formatCurrency(result.pendingWithdraw),
          lastSettlement: result.lastSettlement ? formatDate(result.lastSettlement) : "-"
        }
      });
    } catch (error) {
      console.error("loadSummary", error);
    } finally {
      this.setData({ loading: false });
    }
  },

  goToHistory() {
    wx.navigateTo({ url: "/pages/earnings/history" });
  },

  goToWithdraw() {
    wx.navigateTo({ url: "/pages/earnings/withdraw" });
  }
});

const app = getApp();
const orderService = require("../../services/orderService");
const { formatCurrency } = require("../../utils/format");

Page({
  data: {
    autoAccept: false,
    summary: {
      waitingOrders: 0,
      todayCompleted: 0,
      todayEarnings: "0.00",
      rating: 0
    },
    incomingOrder: null,
    loading: false
  },

  onLoad() {
    this.initAutoAccept();
    this.loadSummary();
    this.pollIncomingOrders();
  },

  onShow() {
    this.loadSummary();
  },

  onUnload() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  },

  onPullDownRefresh() {
    Promise.all([this.loadSummary(), this.checkIncomingOrderOnce()])
      .finally(() => {
        wx.stopPullDownRefresh();
      });
  },

  initAutoAccept() {
    const autoAccept = app.globalData.settings?.autoAccept ?? wx.getStorageSync("autoAccept") ?? false;
    this.setData({ autoAccept });
  },

  handleAutoAcceptChange(event) {
    const autoAccept = event.detail.value;
    this.setData({ autoAccept });
    app.globalData.settings.autoAccept = autoAccept;
    wx.setStorageSync("autoAccept", autoAccept);
  },

  async loadSummary() {
    this.setData({ loading: true });
    try {
      const summary = await orderService.fetchHomeSummary();
      this.setData({
        summary: {
          waitingOrders: summary.waitingOrders ?? 0,
          todayCompleted: summary.todayCompleted ?? 0,
          todayEarnings: formatCurrency(summary.todayEarnings ?? 0),
          rating: summary.rating ?? 0
        }
      });
    } catch (error) {
      console.error("loadSummary failed", error);
    } finally {
      this.setData({ loading: false });
    }
  },

  pollIncomingOrders() {
    this.checkIncomingOrderOnce();
    this.pollingTimer = setInterval(() => {
      this.checkIncomingOrderOnce();
    }, 15000);
  },

  async checkIncomingOrderOnce() {
    try {
      const result = await orderService.fetchIncomingOrders();
      if (result?.order) {
        this.setData({ incomingOrder: result.order });
      }
    } catch (error) {
      console.error("fetchIncomingOrders", error);
    }
  },

  closeIncomingModal() {
    this.setData({ incomingOrder: null });
  },

  async handleAcceptIncoming() {
    const { incomingOrder } = this.data;
    if (!incomingOrder) return;
    try {
      await orderService.acceptOrder(incomingOrder.id);
      wx.showToast({ title: "Order accepted", icon: "success" });
      this.setData({ incomingOrder: null });
      this.loadSummary();
    } catch (error) {
      console.error("accept order", error);
    }
  },

  async handleRejectIncoming() {
    const { incomingOrder } = this.data;
    if (!incomingOrder) return;
    try {
      await orderService.rejectOrder(incomingOrder.id);
      wx.showToast({ title: "Order declined", icon: "none" });
      this.setData({ incomingOrder: null });
      this.loadSummary();
    } catch (error) {
      console.error("reject order", error);
    }
  },

  navigateToOrderList() {
    wx.switchTab({ url: "/pages/orders/index" });
  }
});

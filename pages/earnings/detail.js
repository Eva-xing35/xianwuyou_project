const earningsService = require("../../services/earningsService");
const { formatCurrency, formatDate } = require("../../utils/format");

Page({
  data: {
    orderId: "",
    detail: null,
    loading: false
  },

  onLoad(options) {
    if (options?.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadDetail();
    } else {
      wx.showToast({ title: "Missing order id", icon: "none" });
    }
  },

  onPullDownRefresh() {
    this.loadDetail().finally(() => wx.stopPullDownRefresh());
  },

  async loadDetail() {
    const { orderId } = this.data;
    if (!orderId) return;
    this.setData({ loading: true });
    try {
      const detail = await earningsService.fetchOrderShareDetail(orderId);
      const formatted = {
        ...detail,
        orderAmount: formatCurrency(detail.orderAmount),
        driverShare: formatCurrency(detail.driverShare),
        platformFee: formatCurrency(detail.platformFee),
        settledAt: detail.settledAt ? formatDate(detail.settledAt) : "Pending settlement",
        items: (detail.items || []).map(item => ({
          ...item,
          amount: formatCurrency(item.amount)
        }))
      };
      this.setData({ detail: formatted });
    } catch (error) {
      console.error("loadDetail", error);
    } finally {
      this.setData({ loading: false });
    }
  }
});

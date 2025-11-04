const orderService = require("../../services/orderService");
const { formatDate, formatCurrency } = require("../../utils/format");

const STATUS_MAP = {
  pending: { label: "待接单", showActions: true },
  accepted: { label: "进行中", showActions: false },
  completed: { label: "已完成", showActions: false }
};

Page({
  data: {
    tabs: [
      { key: "pending", text: "待接单" },
      { key: "accepted", text: "进行中" },
      { key: "completed", text: "已完成" }
    ],
    activeStatus: "pending",
    list: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadOrders(true);
  },

  onPullDownRefresh() {
    this.loadOrders(true).finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadOrders(false);
  },

  handleTabChange(event) {
    const status = event.currentTarget.dataset.status;
    if (status === this.data.activeStatus) return;
    this.setData({ activeStatus: status, page: 1, hasMore: true, list: [] }, () => {
      this.loadOrders(true);
    });
  },

  async loadOrders(reset = false) {
    const { activeStatus, page } = this.data;
    const nextPage = reset ? 1 : page + 1;
    this.setData({ loading: true });
    try {
      const response = await orderService.fetchOrders({ status: activeStatus, page: nextPage });
      const orders = (response?.data || []).map(this.transformOrder);
      const list = reset ? orders : [...this.data.list, ...orders];
      this.setData({
        list,
        page: nextPage,
        hasMore: orders.length >= (response?.pageSize || orders.length),
        loading: false
      });
    } catch (error) {
      console.error("loadOrders", error);
      this.setData({ loading: false });
    }
  },

  transformOrder(order) {
    const statusConfig = STATUS_MAP[order.status] || STATUS_MAP.pending;
    return {
      ...order,
      statusText: statusConfig.label,
      showActions: statusConfig.showActions,
      fare: formatCurrency(order.fare),
      departureTime: formatDate(order.departureTime)
    };
  },

  handleOrderTap(event) {
    const { orderId } = event.detail;
    wx.navigateTo({ url: `/pages/orders/detail?id=${orderId}` });
  },

  async handleAccept(event) {
    const orderId = event.detail.orderId;
    try {
      await orderService.acceptOrder(orderId);
      wx.showToast({ title: "接单成功", icon: "success" });
      this.loadOrders(true);
    } catch (error) {
      console.error("accept order", error);
    }
  },

  async handleReject(event) {
    const orderId = event.detail.orderId;
    try {
      await orderService.rejectOrder(orderId);
      wx.showToast({ title: "已拒绝订单", icon: "none" });
      this.loadOrders(true);
    } catch (error) {
      console.error("reject order", error);
    }
  }
});

const orderService = require("../../services/orderService");
const { getDirections } = require("../../services/mapService");
const { formatDate, formatCurrency } = require("../../utils/format");

Page({
  data: {
    orderId: "",
    order: null,
    routeSteps: [],
    loadingRoute: false
  },

  onLoad(options) {
    if (options?.id) {
      this.setData({ orderId: options.id });
      this.loadOrder();
    } else {
      wx.showToast({ title: "Order not found", icon: "none" });
    }
  },

  onPullDownRefresh() {
    this.loadOrder().finally(() => wx.stopPullDownRefresh());
  },

  async loadOrder() {
    const { orderId } = this.data;
    if (!orderId) return;
    wx.showLoading({ title: "Loading" });
    try {
      const data = await orderService.fetchOrderDetail(orderId);
      const order = {
        ...data,
        statusText: this.mapStatus(data.status),
        fare: formatCurrency(data.fare),
        departureTime: formatDate(data.departureTime)
      };
      this.setData({ order });
    } catch (error) {
      console.error("loadOrder", error);
    } finally {
      wx.hideLoading();
    }
  },

  mapStatus(status) {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return "Unknown";
    }
  },

  callCustomer() {
    const phone = this.data.order?.customerPhone;
    if (!phone) {
      wx.showToast({ title: "No phone available", icon: "none" });
      return;
    }
    wx.makePhoneCall({ phoneNumber: phone });
  },

  copyAddress(event) {
    const value = event.currentTarget.dataset.value;
    if (!value) return;
    wx.setClipboardData({ data: value });
  },

  async handleAccept() {
    const { order } = this.data;
    if (!order) return;
    try {
      await orderService.acceptOrder(order.id);
      wx.showToast({ title: "Order accepted", icon: "success" });
      this.loadOrder();
    } catch (error) {
      console.error("accept order", error);
    }
  },

  async handleReject() {
    const { order } = this.data;
    if (!order) return;
    try {
      await orderService.rejectOrder(order.id);
      wx.showToast({ title: "Order declined", icon: "none" });
      this.loadOrder();
    } catch (error) {
      console.error("reject order", error);
    }
  },

  async handleNavigation() {
    const order = this.data.order;
    if (!order?.originLocation || !order?.destinationLocation) {
      wx.showToast({ title: "Missing location info", icon: "none" });
      return;
    }
    this.setData({ loadingRoute: true, routeSteps: [] });
    try {
      const response = await getDirections({
        origin: order.originLocation,
        destination: order.destinationLocation,
        mode: "driving"
      });
      const steps = response.routes?.[0]?.legs?.[0]?.steps || [];
      const routeSteps = steps.map((step, index) => ({
        index: index + 1,
        instruction: step.html_instructions?.replace(/<[^>]+>/g, ""),
        distance: step.distance?.text,
        duration: step.duration?.text
      }));
      this.setData({ routeSteps });
      wx.openLocation({
        latitude: order.originLocation.latitude,
        longitude: order.originLocation.longitude,
        name: order.origin,
        address: order.origin
      });
    } catch (error) {
      console.error("handleNavigation", error);
      wx.showToast({ title: "Navigation failed", icon: "none" });
    } finally {
      this.setData({ loadingRoute: false });
    }
  }
});

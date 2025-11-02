const profileService = require("../../services/profileService");
const { formatDate, formatCurrency } = require("../../utils/format");

Page({
  data: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadHistory(true);
  },

  onPullDownRefresh() {
    this.loadHistory(true).finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadHistory(false);
  },

  async loadHistory(reset = false) {
    const nextPage = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });
    try {
      const res = await profileService.fetchTripHistory({ page: nextPage });
      const trips = (res?.data || []).map(item => ({
        ...item,
        departAt: formatDate(item.departAt),
        amount: formatCurrency(item.amount)
      }));
      this.setData({
        list: reset ? trips : [...this.data.list, ...trips],
        page: nextPage,
        hasMore: trips.length >= (res?.pageSize || trips.length),
        loading: false
      });
    } catch (error) {
      console.error("loadHistory", error);
      this.setData({ loading: false });
    }
  }
});

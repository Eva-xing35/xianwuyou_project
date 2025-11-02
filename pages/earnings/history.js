const earningsService = require("../../services/earningsService");
const { formatCurrency, formatDate } = require("../../utils/format");

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
      const res = await earningsService.fetchEarningHistory({ page: nextPage });
      const items = (res?.data || []).map(item => ({
        ...item,
        amount: formatCurrency(item.amount),
        settledAt: item.settledAt ? formatDate(item.settledAt) : "???"
      }));
      const list = reset ? items : [...this.data.list, ...items];
      this.setData({
        list,
        page: nextPage,
        hasMore: items.length >= (res?.pageSize || items.length),
        loading: false
      });
    } catch (error) {
      console.error("loadHistory", error);
      this.setData({ loading: false });
    }
  },

  goToDetail(event) {
    const orderId = event.currentTarget.dataset.orderId;
    wx.navigateTo({ url: `/pages/earnings/detail?orderId=${orderId}` });
  }
});

const profileService = require("../../services/profileService");
const { formatCurrency, formatDate } = require("../../utils/format");

Page({
  data: {
    list: [],
    loading: false
  },

  onLoad() {
    this.loadProgress();
  },

  onPullDownRefresh() {
    this.loadProgress().finally(() => wx.stopPullDownRefresh());
  },

  async loadProgress() {
    this.setData({ loading: true });
    try {
      const res = await profileService.fetchWithdrawProgress();
      const list = (res?.data || []).map(item => ({
        ...item,
        amount: formatCurrency(item.amount),
        appliedAt: formatDate(item.appliedAt),
        updatedAt: formatDate(item.updatedAt)
      }));
      this.setData({ list });
    } catch (error) {
      console.error("loadProgress", error);
    } finally {
      this.setData({ loading: false });
    }
  }
});

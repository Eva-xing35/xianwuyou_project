App({
  globalData: {
    driverProfile: null,
    sessionToken: "",
    settings: {
      autoAccept: false
    }
  },

  onLaunch() {
    this.initSession();
  },

  initSession() {
    const token = wx.getStorageSync("sessionToken");
    if (token) {
      this.globalData.sessionToken = token;
    } else {
      // Placeholder for real login logic
      const generated = `driver-${Date.now()}`;
      this.globalData.sessionToken = generated;
      wx.setStorageSync("sessionToken", generated);
    }
  }
});

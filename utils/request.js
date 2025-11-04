const config = require("../config/index");

function request({ url, method = "GET", data = {}, header = {}, showLoading = true }) {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      wx.showLoading({ title: "加载中", mask: true });
    }

    wx.request({
      url: `${config.apiBaseUrl}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          handleError(res.data);
          reject(res.data);
        }
      },
      fail(error) {
        handleError(error);
        reject(error);
      },
      complete() {
        if (showLoading) {
          wx.hideLoading();
        }
      }
    });
  });
}

function handleError(error) {
  const message = error?.message || error?.msg || "请求失败，请稍后重试";
  wx.showToast({ title: message, icon: "none", duration: 2000 });
}

module.exports = {
  request
};

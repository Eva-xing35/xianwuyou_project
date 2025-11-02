const { request } = require("../utils/request");
const config = require("../config/index");

function fetchTodaySummary() {
  return request({ url: "/earnings/today" });
}

function fetchEarningHistory({ page = 1, pageSize = config.pageSize }) {
  return request({
    url: "/earnings/history",
    method: "GET",
    data: { page, pageSize },
    showLoading: page === 1
  });
}

function fetchOrderShareDetail(orderId) {
  return request({ url: `/earnings/orders/${orderId}` });
}

function submitWithdrawApplication(payload) {
  return request({ url: "/earnings/withdraw", method: "POST", data: payload });
}

module.exports = {
  fetchTodaySummary,
  fetchEarningHistory,
  fetchOrderShareDetail,
  submitWithdrawApplication
};

const { request } = require("../utils/request");
const config = require("../config/index");

function fetchHomeSummary() {
  return request({ url: "/summary" });
}

function fetchIncomingOrders() {
  return request({ url: "/orders/incoming", method: "GET", showLoading: false });
}

function fetchOrders({ status, page = 1, pageSize = config.pageSize }) {
  return request({
    url: `/orders`,
    method: "GET",
    data: { status, page, pageSize },
    showLoading: page === 1
  });
}

function fetchOrderDetail(orderId) {
  return request({ url: `/orders/${orderId}`, method: "GET" });
}

function acceptOrder(orderId) {
  return request({ url: `/orders/${orderId}/accept`, method: "POST" });
}

function rejectOrder(orderId, reason = "") {
  return request({ url: `/orders/${orderId}/reject`, method: "POST", data: { reason } });
}

module.exports = {
  fetchHomeSummary,
  fetchIncomingOrders,
  fetchOrders,
  fetchOrderDetail,
  acceptOrder,
  rejectOrder
};

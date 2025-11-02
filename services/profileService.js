const { request } = require("../utils/request");
const config = require("../config/index");

function fetchProfile() {
  return request({ url: "/profile" });
}

function updateProfile(payload) {
  return request({ url: "/profile", method: "PUT", data: payload });
}

function fetchTripHistory({ page = 1, pageSize = config.pageSize }) {
  return request({
    url: "/profile/trips",
    method: "GET",
    data: { page, pageSize },
    showLoading: page === 1
  });
}

function fetchWithdrawProgress() {
  return request({ url: "/profile/withdraw-progress", method: "GET", showLoading: false });
}

module.exports = {
  fetchProfile,
  updateProfile,
  fetchTripHistory,
  fetchWithdrawProgress
};

const config = require("../config/index");

function getDirections({ origin, destination, mode = "driving" }) {
  const url = "https://maps.googleapis.com/maps/api/directions/json";
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: "GET",
      data: {
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode,
        key: config.googleMapsApiKey
      },
      success(res) {
        if (res.statusCode === 200 && res.data.status === "OK") {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail(error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  getDirections
};

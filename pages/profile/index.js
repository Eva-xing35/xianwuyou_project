const profileService = require("../../services/profileService");
const validators = require("../../utils/validators");

Page({
  data: {
    form: {
      name: "",
      phone: "",
      idNumber: "",
      vehicleNumber: "",
      driverLicense: ""
    },
    errors: {}
  },

  onLoad() {
    this.loadProfile();
  },

  onPullDownRefresh() {
    this.loadProfile().finally(() => wx.stopPullDownRefresh());
  },

  async loadProfile() {
    try {
      const profile = await profileService.fetchProfile();
      this.setData({ form: { ...this.data.form, ...profile } });
    } catch (error) {
      console.error("loadProfile", error);
    }
  },

  handleInput(event) {
    const field = event.currentTarget.dataset.field;
    const value = event.detail.value;
    this.setData({
      [`form.${field}`]: value,
      errors: { ...this.data.errors, [field]: "" }
    });
  },

  validate() {
    const { form } = this.data;
    const errors = {};

    if (!validators.validateRequired(form.name)) errors.name = "?????";
    if (!validators.validatePhone(form.phone)) errors.phone = "????????";
    if (!validators.validateIdNumber(form.idNumber)) errors.idNumber = "????????";
    if (!validators.validateRequired(form.vehicleNumber)) errors.vehicleNumber = "??????";
    if (!validators.validateRequired(form.driverLicense)) errors.driverLicense = "???????";

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  async submit() {
    if (!this.validate()) return;
    try {
      await profileService.updateProfile(this.data.form);
      wx.showToast({ title: "????", icon: "success" });
    } catch (error) {
      console.error("updateProfile", error);
    }
  },

  goToTripHistory() {
    wx.navigateTo({ url: "/pages/profile/history" });
  },

  goToWithdrawProgress() {
    wx.navigateTo({ url: "/pages/profile/withdraw-status" });
  }
});

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

    if (!validators.validateRequired(form.name)) errors.name = "请填写姓名";
    if (!validators.validatePhone(form.phone)) errors.phone = "请输入有效手机号";
    if (!validators.validateIdNumber(form.idNumber)) errors.idNumber = "请输入有效身份证号";
    if (!validators.validateRequired(form.vehicleNumber)) errors.vehicleNumber = "请填写车牌号";
    if (!validators.validateRequired(form.driverLicense)) errors.driverLicense = "请填写驾驶证号";

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  async submit() {
    if (!this.validate()) return;
    try {
      await profileService.updateProfile(this.data.form);
      wx.showToast({ title: "保存成功", icon: "success" });
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

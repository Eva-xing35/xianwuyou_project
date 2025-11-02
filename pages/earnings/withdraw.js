const earningsService = require("../../services/earningsService");
const validators = require("../../utils/validators");

Page({
  data: {
    form: {
      accountType: "personal",
      accountName: "",
      bankAccount: "",
      idNumber: "",
      amount: "",
      remark: ""
    },
    errors: {}
  },

  handleAccountTypeChange(event) {
    const accountType = event.detail.value;
    this.setData({
      "form.accountType": accountType,
      errors: { ...this.data.errors, bankAccount: "" }
    });
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

    if (!validators.validateRequired(form.accountName)) {
      errors.accountName = "Enter the account holder name";
    }

    if (!validators.validateBankAccount(form.bankAccount, form.accountType === "corporate" ? "corporate" : "personal")) {
      errors.bankAccount = form.accountType === "corporate" ? "Corporate accounts must be 12-30 digits" : "Personal accounts must be 10-18 digits";
    }

    if (!validators.validateRequired(form.idNumber) || !validators.validateIdNumber(form.idNumber)) {
      errors.idNumber = "Enter a valid ID or license";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Enter an amount greater than 0";
    }

    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  async submit() {
    if (!this.validate()) return;
    try {
      await earningsService.submitWithdrawApplication(this.data.form);
      wx.showToast({ title: "Submitted", icon: "success" });
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1200);
    } catch (error) {
      console.error("submit withdraw", error);
    }
  }
});

function validatePhone(phone) {
  const reg = /^(\+?\d{1,4})?\d{7,11}$/;
  return reg.test(phone);
}

function validateBankAccount(account, type = "personal") {
  if (!account) return false;
  if (type === "corporate") {
    return /^\d{12,30}$/.test(account);
  }
  return /^\d{10,18}$/.test(account);
}

function validateIdNumber(idNumber) {
  const reg = /^(?:\d{15}|\d{18}|\d{17}[\dXx])$/;
  return reg.test(idNumber);
}

function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

module.exports = {
  validatePhone,
  validateBankAccount,
  validateIdNumber,
  validateRequired
};

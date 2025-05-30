const { isValidPhoneNumber } = require('libphonenumber-js');

function validateInternationalPhone(phone) {
  return isValidPhoneNumber(phone);
}

module.exports = validateInternationalPhone;

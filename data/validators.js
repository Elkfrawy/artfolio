module.exports = {
  isNonEmptyString(inputString) {
    return inputString && typeof inputString === 'string' && inputString.length > 0;
  },
  isPositiveNumber(num) {
    return typeof num === 'number' && num >= 0;
  },
  isValidEmail(email) {
    let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return typeof email === 'string' && email.match(mailformat);
  },
  isValidPassword(pw) {
    return this.isNonEmptyString(pw) && pw.length >= 8;
  },
  isValidUserId(userId) {
    return typeof userId == 'string' && userId;
  },
  validateGender(gender) {
    if (gender === 'Male' || gender === 'Female' || gender === 'Other') {
      return true;
    } else {
      return false;
    }
  },
  isArrayOfStrings(sArray) {
    if (!Array.isArray(sArray)) return false;

    for (let i = 0; i < sArray.length; i++) {
      if (typeof sArray[i] !== 'string') {
        return false;
      }
    }

    return true;
  },
  isValidBirthday(birthDay) {
    return +birthDay <= +Date.now();
  },
  isLettersOnly(name) {
    return this.isNonEmptyString(name) && name.match(/^[A-Za-z ']+$/);
  },
};

module.exports = {
  isNonEmptyString(inputString) {
    return inputString && typeof inputString === 'string' && inputString.trim().length > 0;
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
    // non-empty
    // start with letter
    // contain letter, space, . , '
    return this.isNonEmptyString(name) && /^[A-Za-z .']+$/i.test(name) && /^[A-Za-z]/i.test(name);
  },

  isValidURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i'
    ); // fragment locator
    return !!pattern.test(str);
  },
};

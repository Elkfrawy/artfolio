  
module.exports = {
    isNonEmptyString(inputString) {
      return (
        inputString && typeof inputString === 'string' && inputString.length > 0
      );
    },
    isPositiveNumber(num) {
      return typeof num === 'number' && num >= 0;
    },
    isValidEmail(email) {
      let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return typeof email === 'string' && email.match(mailformat);
    },
    isValidPassword(pw) {
      // to-do
      return this.isNonEmptyString(pw);
    },
    isValidUserId(userId){
        return typeof userId == 'string' && userId;
    },
    isNonEmptyString(inputString) {
    return inputString && typeof inputString === 'string' && inputString.length > 0;
    },
    isPositiveNumber(num) {
    return typeof num === 'number' && num >= 0;
    },
};

module.exports = {
  isNonEmptyString(inputString) {
    return inputString && typeof inputString === 'string' && inputString.length > 0;
  },
  isPositiveNumber(num) {
    return typeof num === 'number' && num >= 0;
  },
};

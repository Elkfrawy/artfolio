function isNonEmptyString(inputString) {
  return inputString && typeof inputString === 'string' && inputString.length > 0;
}

module.exports = { isNonEmptyString };

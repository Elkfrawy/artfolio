const mongoose = require('mongoose');
let _connection = undefined;

module.exports = async () => {
  if (!_connection) {
    await mongoose.connect('mongodb://localhost:27017/artfolio', { useNewUrlParser: true });
    _connection = mongoose.connection;
  }
  return _connection;
};

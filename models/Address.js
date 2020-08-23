const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String, default: 'United States' },
});

module.exports = mongoose.model('address', AddressSchema);

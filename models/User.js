const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const addressSchema = require('./Address');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String },
  address: addressSchema.schema,
  birthday: { type: Date },
  biography: { type: String, default: '' },
  websiteUrl: { type: String },
  hashedPassword: { type: String, required: true },
  userPictureId: { type: String },
  _id: { type: String, default: uuidv4 },
});

module.exports = mongoose.model('user', UserSchema);

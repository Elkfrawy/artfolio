const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const addressSchema = require('./Address');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String, default: 'Other' },
  address: addressSchema.schema,
  birthday: { type: Date },
  biography: { type: String, default: '' },
  websiteUrl: { type: String },
  hashedPassword: { type: String, required: true },
  userPictureId: { type: String },
  socialMedia: { type: Object, default: {} },
  _id: { type: String, default: uuidv4 },
  likedArtworks: { type: Array, default: [] },
});

module.exports = mongoose.model('user', UserSchema);

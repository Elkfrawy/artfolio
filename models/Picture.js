const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PictureSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    data: { type: Buffer, required: true },
    contentType: { type: String, require: true },
    artworkId: { type: String, default: '' },
    _id: { type: String, default: uuidv4 },
  },
  { toJSON: { virtuals: true } }
);

PictureSchema.virtual('pictureUrl').get(function () {
  return `/pictures/content/${this._id}`;
});

module.exports = mongoose.model('picture', PictureSchema);

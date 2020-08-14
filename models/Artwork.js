const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const comment = require('./Comment');
const picture = require('./Picture');

const ArtworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    createDate: { type: Date, required: true },
    postDate: { type: Date, default: Date.now },
    category: { type: String, required: true },
    comments: [comment.schema],
    userId: { type: String, required: true },
    username: { type: String, required: true },
    numberOfViews: { type: Number, default: 0 },
    lastView: { type: Date, default: Date.now },
    _id: { type: String, default: uuidv4 },
  },
  { toJSON: { virtuals: true } }
);

ArtworkSchema.virtual('pictures', {
  ref: 'picture',
  localField: '_id',
  foreignField: 'artworkId',
  justOne: false,
  options: { projection: '-data' },
});

ArtworkSchema.pre('find', function () {
  this.populate('pictures');
});

module.exports = mongoose.model('artwork', ArtworkSchema);

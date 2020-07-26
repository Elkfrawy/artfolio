const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CommentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  comment: { type: String, required: true },
  _id: { type: String, default: uuidv4 },
});

module.exports = mongoose.model('comment', CommentSchema);

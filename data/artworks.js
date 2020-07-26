// const mongoCollections = require('../config/mongoCollections');
const models = require('../models');
const validators = require('./validators');
const users = require('./users');

module.exports = {
  async createArtwork(title, description, category, createDate, userId, pictures) {
    // ** TODO get the user and set their username here
    let username = 'Ayman Elkfrawy';
    const newArtwork = new models.Artwork({
      title,
      description,
      category,
      createDate,
      username,
      userId,
      pictures,
    }); // Other attributes will set to the default value

    const createdArtwork = await saveSafely(newArtwork);
    return createdArtwork;
  },

  async updateArtwork(id, artwork) {
    if (!validators.isNonEmptyString(id)) throw 'Please provide an artwork ID';
    if (!artwork) throw 'Please provide an artwork to update with';

    const oldArtwork = await models.Artwork.findById(id).exec(); // Don't forgot to call "exec()" for any query
    if (!oldArtwork) throw `There is no artwork with the given ID: ${id}`;

    if (artwork.title) {
      oldArtwork.title = artwork.title;
    }
    if (artwork.description) {
      oldArtwork.description = artwork.description;
    }
    // *** TODO check all other fields

    return await saveSafely(oldArtwork); // Save the the changes
  },

  async getArtworksByKeyword(keyword) {
    if (!validators.isNonEmptyString(keyword)) throw 'Please provide a keyword to search by';
    return await models.Artwork.find({
      $or: [{ title: new RegExp(keyword, 'i') }, { description: new RegExp(keyword, 'i') }],
    }).exec();
  },

  async getArtworksByCategory(category) {
    if (!validators.isNonEmptyString(category)) throw 'Please provide a category to search by';
    return await models.Artwork.find({ category: new RegExp(category, 'i') }).exec();
  },

  async getArtworksByUsername(username) {
    if (!validators.isNonEmptyString(username)) throw 'Please provide a username to search by';

    return await models.Artwork.find({ username: new RegExp(username, 'i') }).exec();
  },

  async getArtworksByViews(skips = 0, count = 10) {
    return await genericGetWithSort(skips, count, { numberOfViews: -1 });
  },

  async getRecentlyVisitedArtworks() {
    return await genericGetWithSort(skips, count, { lastView: -1 });
  },

  async getRecentlyAddedArtworks() {
    return await genericGetWithSort(skips, count, { postDate: -1 });
  },

  async createComment(userId, artworkId, comment) {
    if (!validators.isNonEmptyString(userId)) throw 'Please provide userId for the comment';
    if (!validators.isNonEmptyString(artworkId)) throw 'Please provide an artworkId for the comment';
    if (!validators.isNonEmptyString(comment)) throw 'Please provide the comment string';

    const user = await users.getUserById(userId);
    const artwork = await getArtworkById(artworkId);

    let comment = new models.Comment({
      userId,
      username: user.firstName + ' ' + user.lastName,
      comment,
    });
    artwork.comments.push(comment);
    await artwork.save();

    return comment;
  },

  async deleteComment(artworkId, commentId) {
    if (!validators.isNonEmptyString(artworkId)) throw 'Please provide artworkId for the comment to delete';
    if (!validators.isNonEmptyString(commentId)) throw 'Please provide the commentId to delete';

    const artwork = getArtworkById(artworkId);
    const comment = artwork.comments.id(commentId);
    if (comment) {
      comment.remove();
    } else {
      throw "Didn't find a comment with the given ID to delete";
    }
  },
};

async function saveSafely(document) {
  try {
    return await document.save();
  } catch (e) {
    throw e.message; // Rethrow only the message instead of the whole stack trace
  }
}

async function genericGetWithSort(skips = 0, count = 0, sorting) {
  if (!validators.isPositiveNumber(skips)) throw 'Skips must be positive number';
  if (!validators.isPositiveNumber(skips)) throw 'Counts must be positive number';

  return await models.Artwork.find({}).sort(sorting).skip(skips).limit(count);
}

// const mongoCollections = require('../config/mongoCollections');
const models = require('../models');
const validators = require('./validators');
const users = require('./users');
const pics = require('./pictures');
const { artworks } = require('.');

module.exports = {
  async getArtworkById(id) {
    if (!validators.isNonEmptyString(id)) throw 'Id is not valid';
    const artWork = await models.Artwork.findById(id).exec();
    if (!artWork) throw `There is no artWork with that ID: ${id}`;
    return artWork;
  },

  async getArtWorksByUserId(userId) {
    if (!validators.isValidUserId(userId)) throw 'userId is not valid';
    return await models.Artwork.find({ userId: userId }).exec();
  },

  async getAllArtWorks() {
    return await models.Artwork.find({}).exec();
  },

  async createArtwork(artwork) {
    if (!validators.isNonEmptyString(artwork.title)) throw 'You must provide a title';
    if (!validators.isNonEmptyString(artwork.description)) throw 'You must provide a description';
    if (!validators.isNonEmptyString(artwork.category)) throw 'You must provide a category';
    if (!artwork.createDate) throw 'You must provide a createDate';
    if (!artwork.userId) throw 'You must provide a userId';

    const userObj = await users.getUserById(artwork.userId);
    const username = userObj.firstName + ' ' + userObj.lastName;

    const newArtwork = new models.Artwork({
      title: artwork.title,
      description: artwork.description,
      category: artwork.category,
      createDate: artwork.createDate,
      userId: artwork.userId,
      username: username,
    });

    const createdArtwork = await saveSafely(newArtwork);
    return createdArtwork;
  },

  async updateArtwork(id, artwork) {
    if (!validators.isNonEmptyString(id)) throw 'Please provide an artwork ID';
    if (!artwork) throw 'Please provide an artwork to update with';

    const oldArtwork = await models.Artwork.findById(id).exec();
    if (!oldArtwork) throw `There is no artwork with the given ID: ${id}`;

    if (artwork.title) {
      oldArtwork.title = artwork.title;
    }
    if (artwork.category) {
      oldArtwork.category = artwork.category;
    }
    if (artwork.description) {
      oldArtwork.description = artwork.description;
    }
    if (artwork.createDate) {
      oldArtwork.createDate = artwork.createDate;
    }
    if (artwork.numberOfViews) {
      oldArtwork.numberOfViews = artwork.numberOfViews;
    }
    if (artwork.lastView) {
      oldArtwork.lastView = artwork.lastView;
    }
    return await saveSafely(oldArtwork); // Save the the changes
  },

  async deleteArtwork(id) {
    if (!validators.isNonEmptyString(id)) throw 'Please provide an id to delete';
    const deletedArtwork = await models.Artwork.findByIdAndDelete(id).exec();
    return deletedArtwork;
  },

  async getArtworksByAny(query) {
    if (!validators.isNonEmptyString(query)) throw 'Please provide a keyword to search by';
    return await models.Artwork.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { category: new RegExp(query, 'i') },
        { username: new RegExp(query, 'i') },
      ],
    }).exec();
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

  async getRecentlyVisitedArtworks(skips = 0, count = 0) {
    return await genericGetWithSort(skips, count, { lastView: -1 });
  },

  async getRecentlyAddedArtworks(skips = 0, count = 0) {
    return await genericGetWithSort(skips, count, { postDate: -1 });
  },

  async createComment(userId, artworkId, commentText) {
    if (!validators.isNonEmptyString(userId)) throw 'Please provide userId for the comment';
    if (!validators.isNonEmptyString(artworkId)) throw 'Please provide an artworkId for the comment';
    if (!validators.isNonEmptyString(commentText)) throw 'Please provide the comment string';

    const user = await users.getUserById(userId);
    const artwork = await this.getArtworkById(artworkId);

    let comment = new models.Comment({
      userId,
      userName: user.firstName + ' ' + user.lastName,
      comment: commentText,
    });
    artwork.comments.push(comment);
    await artwork.save();

    return comment;
  },

  async deleteComment(artworkId, commentId) {
    if (!validators.isNonEmptyString(artworkId)) throw 'Please provide artworkId for the comment to delete';
    if (!validators.isNonEmptyString(commentId)) throw 'Please provide the commentId to delete';

    const artwork = await this.getArtworkById(artworkId);
    const comment = artwork.comments.id(commentId);
    if (comment) {
      comment.remove();
      await artwork.save();
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

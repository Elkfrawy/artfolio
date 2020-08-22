const models = require('../models');
const validators = require('./validators');
const artworks = require('./artworks');

module.exports = {
  async getAllUsers() {
    return await models.User.find({}).exec();
  },

  async getUserById(userId) {
    if (!validators.isNonEmptyString(userId)) throw 'Please provide a user ID';
    const user = await models.User.findById(userId).exec();
    if (!user) throw `There is no user with the given ID: ${userId}`;
    return user;
  },

  async getUserByEmail(email) {
    if (!validators.isValidEmail(email)) throw 'Email address is not valid';
    return await models.User.findOne({ email: email.toLowerCase() }).exec();
  },

  async updateUser(id, user) {
    if (!validators.isValidUserId(id)) throw 'Please provide a user ID to update';
    if (!user) throw 'Please provide updated user information';

    // make sure the updated information firstName, lastName and email are valid, if provided.
    if (user.firstName && !validators.isNonEmptyString(user.firstName)) throw 'Updated first name is not valid';

    if (user.lastName && !validators.isNonEmptyString(user.lastName)) throw 'Updated last name is not valid';

    if (user.email) {
      if (!validators.isValidEmail(user.email)) throw 'Updated email is not valid';
      user.email = user.email.toLowerCase();
    }

    const updatedUser = await models.User.findByIdAndUpdate(id, user, {
      new: true, // return the updated object
    }).exec();

    const updatedUsername = updatedUser.firstName + ' ' + updatedUser.lastName;

    const artworkList = await models.Artwork.find({ userId: id }).exec();
    for (i = 0; i < artworkList.length; i++) {
      const currentArtwork = artworkList[i];
      await models.Artwork.findByIdAndUpdate(currentArtwork._id, { username: updatedUsername }).exec();
    }

    const commentedArtworkList = await models.Artwork.find({ 'comments.userId': id }).exec();
    for (i = 0; i < commentedArtworkList.length; i++) {
      const currentCommentedArtwork = commentedArtworkList[0];
      const commentList = currentCommentedArtwork.comments;

      for (comment of commentList) {
        if (comment.userId === id) {
          comment.userName = updatedUsername;
        }
      }
      await models.Artwork.findByIdAndUpdate(currentCommentedArtwork._id, { comments: commentList }).exec();
    }

    return updatedUser;
  },

  async createUser(user) {
    if (!validators.isLettersOnly(user.firstName)) throw 'First name must be  provided and contains only letters';
    if (!validators.isLettersOnly(user.lastName)) throw 'Last name must be  provided and contains only letters';
    if (!validators.isValidEmail(user.email)) throw 'Email is not valid';
    if (!validators.isNonEmptyString(user.hashedPassword)) throw 'Please provide a password';
    const newUser = new models.User(user);
    const createdUser = await saveSafely(newUser);
    return createdUser;
  },

  async deleteUser(userId) {
    if (!validators.isNonEmptyString(userId)) throw 'Please provide a user ID to delete';
    const deletedUser = await models.User.findByIdAndDelete(userId).exec();
    return deletedUser;
  },
  
  async appendArtworkToLikes(userId, artworkId){
      const user = await this.getUserById(userId);
      user.likedArtworks.push(artworkId); 
      return saveSafely(user);
  }, 

  async removeArtworkToLikes(userId, artworkId){
    const user = await this.getUserById(userId);
    const index = user.likedArtworks.indexOf(artworkId); 
    if (index > -1) {
      user.likedArtworks.splice(index, 1);
    }
    return saveSafely(user);
}
};

  


async function saveSafely(document) {
  try {
    return await document.save();
  } catch (e) {
    throw e.message;
  }
}

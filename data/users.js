const models = require('../models');
const validators = require('./validators');

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
    return await models.User.find({ email: email }).exec();
  },

  async updateUser(id, user) {
    if (!validators.isNonEmptyString(id))
      throw 'Please provide a user ID to update';
    if (!user) throw 'Please provide updated user information';

    // make sure the updated information firstName, lastName and email are valid, if provided.
    if (user.firstName && !validators.isNonEmptyString(user.firstName))
      throw 'Updated first name is not valid';

    if (user.lastName && !validators.isNonEmptyString(user.lastName))
      throw 'Updated last name is not valid';

    if (user.email) {
      if (!validators.isValidEmail(user.email))
        throw 'Updated email is not valid';
      user.email = user.email.toLowerCase();
    }

    const updatedUser = models.User.findByIdAndUpdate(id, user, {
      new: true, // return the updated object
    }).exec();
    return updatedUser;
  },

  async createUser(user) {
    if (!validators.isNonEmptyString(user.firstName))
      throw 'First name is not provided';
    if (!validators.isNonEmptyString(user.lastName))
      throw 'Last name is not provided';
    if (!validators.isValidEmail(user.email)) throw 'Email is not valid';
    if (!validators.isValidPassword(user.hashedPassword))
      throw 'Please provide a password';
    const newUser = new models.User(user);
    const createdUser = await saveSafely(newUser);
    return createdUser;
  },

  async deleteUser(userId) {
    if (!validators.isNonEmptyString(userId))
      throw 'Please provide a user ID to delete';
    const deletedUser = await models.User.findByIdAndDelete(userId).exec();
    return deletedUser;
  },
};

async function saveSafely(document) {
  try {
    return await document.save();
  } catch (e) {
    throw e.message;
  }
}

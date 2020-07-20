/*
CS546 WS - Final Project
Artfolio
*/

const mongoCollections = require('../config/mongoCollections');
const ObjectID = require('mongodb').ObjectID;
const users = mongoCollections.users;

module.exports = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection
      .find({ userArtworks: 0, userComments: 0 })
      .toArray();
    if (!userList) throw 'No user available yet';
    return userList;
  },

  async getUserById(id) {
    const userCollection = await users();
    const user = await userCollection.findOne(
      { _id: id },
      { userArtworks: 0, userComments: 0 }
    );
    if (!user) throw 'User not found';
    return user;
  },

  async getUserByEmail(email) {
    const userCollection = await users();
    // valid email
    const user = await userCollection.findOne(
      { email: email },
      { userArtworks: 0, userComments: 0 }
    );
    if (!user) throw 'User not found';
    return user;
  },

  async getUserByName(firstName, lastName) {
    if (!firstName && !lastName) throw 'Input name is not valid';
    const userCollection = await users();
    if (!firstName && lastName) {
      const userList = await userCollection
        .find({ lastName: lastName }, { userArtworks: 0, userComments: 0 })
        .toArray();
      if (!userList) throw 'No user available yet';
      return userList;
    }

    if (firstName && !lastName) {
      const userList = await userCollection
        .find({ firstName: firstName }, { userArtworks: 0, userComments: 0 })
        .toArray();
      if (!userList) throw 'No user available yet';
      return userList;
    }

    if (firstName && lastName) {
      const userList = await userCollection
        .find(
          { firstName: firstName, lastName: lastName },
          { userArtworks: 0, userComments: 0 }
        )
        .toArray();
      if (!userList) throw 'No user available yet';
      return userList;
    }
  },

  async updateUser(id, user) {
    const currentUser = await this.getUserById(id);
    if (!currentUser) throw 'No User Found by the Given Id';

    const updatedUser = {};
    if (user.firstName) {
      updatedUser.firstName = user.firstName;
    }

    if (user.LastName) {
      updatedUser.lastName = user.LastName;
    }

    if (user.email) {
      updatedUser.email = user.email;
    }

    if (user.gender) {
      updatedUser.gender = user.gender;
    }

    const address = {};
    if (user.Address.streetAddress) {
      address.streetAddress = user.Address.streetAddress;
    }

    if (user.Address.city) {
      address.city = user.Address.city;
    }

    if (user.Address.state) {
      address.state = user.Address.state;
    }

    if (user.Address.zipCode) {
      address.zipCode = user.Address.zipCode;
    }

    if (user.Address.country) {
      address.country = user.Address.country;
    }

    if (Object.keys(address).length) {
      updatedUser.Address = address;
    }

    if (user.birthday) {
      updatedUser.birthday = user.birthday;
    }

    if (user.biography) {
      updatedUser.biography = user.biography;
    }

    if (user.websiteUrl) {
      updatedUser.websiteUrl = user.websiteUrl;
    }

    if (user.hashedPassword) {
      updatedUser.hashedPassword = user.hashedPassword;
    }

    if (user.userArtworks) {
      updatedUser.userArtworks = user.userArtworks;
    }

    if (user.userPicture) {
      updatedUser.userPicture = user.userPicture;
    }

    if (user.userComments) {
      updatedUser.userComments = user.userComments;
    }

    const userCollection = await users();
    const updatedUserInfo = await userCollection.updateOne(
      { _id: id },
      { $set: updatedUser }
    );

    if (updatedUserInfo.matchedCount && !updatedUserInfo.modifiedCount)
      throw 'Failed to update user';

    return await this.getUserById(id);
  },

  async createUser(user) {
    const userCollection = await users();
  },

  async deleteUser(id) {},
};

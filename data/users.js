/*
CS546 WS - Final Project
Artfolio
*/

const mongoCollections = require('../config/mongoCollections');
const ObjectID = require('mongodb').ObjectID;
const users = mongoCollections.users;

function validateEmail(inputEmail) {
  let mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!inputEmail.match(mailformat)) throw 'Invalid Email Address';
}

module.exports = {
  async getAllUsers() {
    const userCollection = await users();
    const userList = await userCollection
      .find({}, { userArtworks: 0, userComments: 0 })
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
    validateEmail(email);
    const user = await userCollection.findOne(
      { email: email.toLowerCase() },
      { userArtworks: 0, userComments: 0 }
    );
    if (!user) throw 'User not found';
    return user;
  },

  async getUserByName(name) {
    if (!name.firstName && !name.lastName) throw 'Input name is not valid';
    const userCollection = await users();
    if (!name.firstName && name.lastName) {
      const userList = await userCollection
        .find({ lastName: name.lastName }, { userArtworks: 0, userComments: 0 })
        .toArray();
      if (!userList) throw 'No user available yet';
      return userList;
    }

    if (name.firstName && !name.lastName) {
      const userList = await userCollection
        .find(
          { firstName: name.firstName },
          { userArtworks: 0, userComments: 0 }
        )
        .toArray();
      if (!userList) throw 'No user available yet';
      return userList;
    }

    if (name.firstName && name.lastName) {
      const userList = await userCollection
        .find(
          { firstName: name.firstName, lastName: name.lastName },
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
      updatedUser.email = user.email.toLowerCase();
    }

    if (user.gender) {
      updatedUser.gender = user.gender;
    }

    if (user.Address) {
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
    // user firstName, secondName, email are required
    // other information are optional
    if (!user.firstName) throw 'First name is not provided';
    if (!user.lastName) throw 'Last name is not provided';
    if (!user.email) throw 'Email is not provided';
    validateEmail(user.email);

    const newUser = {};
    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.email = user.email.toLowerCase();

    if (user.gender) {
      newUser.gender = user.gender;
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
      newUser.Address = address;
    }

    if (user.birthday) {
      newUser.birthday = user.birthday;
    }

    if (user.biography) {
      newUser.biography = user.biography;
    }

    if (user.websiteUrl) {
      newUser.websiteUrl = user.websiteUrl;
    }

    if (user.hashedPassword) {
      newUser.hashedPassword = user.hashedPassword;
    }

    if (user.userPicture) {
      newUser.userPicture = user.userPicture;
    }

    newUser.userArtworks = [];
    newUser.userComments = [];

    const insertNewUserInfo = await userCollection.insertOne(newUser);
    if (insertNewUserInfo.insertedCount === 0)
      throw 'Failed to create new user.';
    return this.getUserById(insertNewUserInfo.insertedId);
  },

  async deleteUser(id) {
    const userCollection = await users();
    const deleteInfo = await userCollection.removeOne({ _id: id });
    if (deleteInfo.deletedCount === 0) throw 'Failed to delete user';
  },
};

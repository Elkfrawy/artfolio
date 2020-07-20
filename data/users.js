/*
CS546 WS - Final Project
Artfolio
*/

const mongoCollections = require('../config/mongoCollections');
const ObjectID = require('mongodb').ObjectID;
const users = mongoCollections.users;

module.exports = {
  async getAllUsers() {},

  async getUserById(id) {},

  async getUserByEmail(email) {},

  async getUserByName(name) {},

  async updateUser(id, user) {},

  async createUser(user) {
    const userCollection = await users();
  },

  async deleteUser(id) {},
};

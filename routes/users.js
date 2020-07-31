const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const upload = require('../config/upload');
var path = require('path');
var fs = require('fs').promises;

router.get('/', async (req, res) => {
  try {
    const userList = await userData.getAllUsers();
    res.render('users/all', { users: userList });
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await userData.getUserById(req.params.id);
    res.render('users/single', { user: user });
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/', async (req, res) => {
  const newUserData = req.body;
  // to-do basic check
  try {
    const newUser = await userData.createUser(newUserData);
    res.redirect(`/users/${newUser._id}`);
  } catch (e) {
    res.status(500).send();
  }
});

router.put('/:id', async (req, res) => {
  let userInfo = req.body;
  // to-do basic checks

  try {
    await userData.getUserById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    const updatedUser = await userData.updateUser(req.params.id, userInfo);
    res.redirect(`/users/${updatedUser._id}`);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await userData.getUserById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    await userData.deleteUser(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    res.Status(500);
  }
});

module.exports = router;

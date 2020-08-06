const express = require('express');
const router = express.Router();
const data = require('../data');
const userData = data.users;
const validators = data.validators;
const upload = require('../config/upload');
var path = require('path');
var fs = require('fs').promises;

router.get('/login', async (req, res) => {
  res.render('users/login', { hasError: false });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user;
  try {
    user = userData.getUserByEmail(email);
  } catch (e) {
    res.status(401).render('users/login', { hasError: true, error: e });
    return;
  }

  if (!validators.isNonEmptyString(password)) {
    res.status(401).render('users/login', { hasError: true, error: 'Invalid Password' });
    return;
  }
  // use bcrypt to compare later
  const match = true;
  if (match) {
    req.session.user = user;
    res.redirect('/private');
  } else {
    res.status(401).render('users/login', { hasError: true, error: 'Email/Password not match, try again' });
  }
});

// public page
router.get('/', async (req, res) => {
  try {
    const userList = await userData.getAllUsers();
    res.render('users/all', { users: userList });
  } catch (e) {
    res.status(500).send();
  }
});

// private page for user to see his/her own profile
router.get('/private', async (req, res) => {
  try {
    const user = await userData.getUserById(req.session.user._id);
    res.render('users/single', { user: user });
  } catch (e) {
    res.status(500).send();
  }
});

// private page for user to edit his/her own profile
router.get('/edit', async (req, res) => {
  const user = await userData.getUserById(req.session.user._id);
  res.render('users/editprofile', { user: user });
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

// Validated user to update information
router.put('/', async (req, res) => {
  let userInfo = req.body;
  // to-do basic checks

  try {
    await userData.getUserById(req.session.user._id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    const updatedUser = await userData.updateUser(req.session.user._id, userInfo);
    req.session.user = updatedUser;
    res.redirect('/private');
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

const express = require('express');
const router = express.Router();
const data = require('../data');
const artworks = data.artworks;
const pictures = data.pictures;
const validators = data.validators;
const users = data.users;
const upload = require('../config/upload');
var path = require('path');
var fs = require('fs').promises;
const bcrypt = require('bcrypt');
const { response } = require('express');

// public page
router.get('/', async (req, res) => {
  try {
    const userList = await users.getAllUsers();
    res.render('users/all', { users: userList });
  } catch (e) {
    res.status(500).send();
  }
});

// private page for user to see his/her own profile
router.get('/profile', async (req, res) => {
  try {
    const singleUser = await userData.getUserById(req.session.user._id);
    res.render('users/single', { user: singleUser });
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/register', async (req, res) => {
  res.render('users/register');
});

router.post('/register', async (req, res) => {
  const errors = [];
  const { firstName, lastName, gender, email, password, passwordConfirm } = req.body;
  if (!data.validators.isNonEmptyString(firstName)) errors.push('First name is missing');
  if (!data.validators.isNonEmptyString(lastName)) errors.push('Last name is missing');
  if (!data.validators.isNonEmptyString(gender)) errors.push('Gender is missing');
  else if (!data.validators.validateGender(gender)) errors.push('Gender provide is invalid');
  if (!data.validators.isNonEmptyString(email)) errors.push('Email address is missing');
  else if (!data.validators.isValidEmail(email)) errors.push('The provided emails is incorrect');
  if (!data.validators.isNonEmptyString(password)) errors.push('Password is missing');
  else if (!data.validators.isValidPassword(password)) errors.push('Password must be at least of length 8');
  if (!data.validators.isNonEmptyString(passwordConfirm)) errors.push('Password confirmation is missing');
  if (password !== passwordConfirm) errors.push("Password and confirmation don't match");

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = { firstName, lastName, email: email.toLowerCase(), hashedPassword, gender };

  if (errors.length > 0) {
    res.status(400).render('users/register', { errors, user });
  } else {
    try {
      const existingUser = await users.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        res.status(400).render('users/register', { errors: ['This email address is already used.'], user });
      } else {
        user = await users.createUser(user);
        res.render('users/reg_success', { user });
      }
    } catch (e) {
      res.status(500).render('users/register', { errors: [e], user });
    }
  }
});

router.get('/login', async (req, res) => {
  res.render('users/login');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  if (!data.validators.isNonEmptyString(email)) errors.push('Email address is missing');
  if (!data.validators.isNonEmptyString(password)) errors.push('Password is missing');

  if (errors.length > 0) {
    res.status(400).render('users/login', { errors, email });
  } else {
    const user = await users.getUserByEmail(email.toLowerCase());
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      req.session.user = { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName };
      res.redirect('/');
    } else {
      res.status(400).render('users/login', { errors: ['Email or Password is incorrect'], email });
    }
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();

  res.render('users/logout', { title: 'Logging out' });
});

// private page for user to edit his/her own profile
router.get('/edit', async (req, res) => {
  //const user = await userData.getUserById(req.session.user._id);
  //res.render('users/editprofile', { user: user });
  res.render('users/editprofile');
});

// Validated user to update information
router.put('/', async (req, res) => {
  let userInfo = req.body;
  // to-do basic checks

  try {
    await users.getUserById(req.session.user._id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    const updatedUser = await users.updateUser(req.session.user._id, userInfo);
    req.session.user = updatedUser;
    res.redirect('/private');
  } catch (e) {
    res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await users.getUserById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  try {
    await users.deleteUser(req.params.id);
    res.sendStatus(200);
  } catch (e) {
    res.Status(500);
  }
});

router.get('/portfolio/:id', async (req, res) => {
  try {
    const user = await users.getUserById(req.params.id);
    const artworksByUserId = await artworks.getArtWorksByUserId(req.params.id);
    res.render('portfolios/index', { artworks: artworksByUserId, user: user });
  } catch (e) {
    res.status(404).render('portfolios/index');
  }
});
module.exports = router;

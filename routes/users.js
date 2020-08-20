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
  if (!req.session.user) {
    res.render('users/login');
    return;
  }
  try {
    validators.isNonEmptyString(req.session.user._id);
    const singleUser = await users.getUserById(req.session.user._id);
    const artworksByUserId = await artworks.getArtWorksByUserId(req.session.user._id);
    res.render('portfolios/portfolio', { user: singleUser, artworks: artworksByUserId, authenticated: true });
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
  if (!req.session.user) {
    res.redirect('/users/login');
    return;
  }
  validators.isNonEmptyString(req.session.user._id);
  const singleUser = await users.getUserById(req.session.user._id);
  res.render('users/edit_profile', { user: singleUser, displayProfile: true, today: Date.now() });
});

// Validated user to update information
router.patch('/updateprofile', async (req, res) => {
  if (!req.session.user) {
    res.redirect('users/login');
    return;
  }
  validators.isValidUserId(req.session.user._id);
  const currentUser = await users.getUserById(req.session.user._id);

  let userInfo = req.body;
  const errors = [];
  const firstName = userInfo.firstName;
  const lastName = userInfo.lastName;
  const gender = userInfo.gender;
  if (userInfo.birthday) {
    userInfo.birthday = new Date(userInfo.birthday);
  }
  // first name and last name are required
  if (!validators.isNonEmptyString(firstName)) errors.push('First name is missing');
  if (!validators.isNonEmptyString(lastName)) errors.push('Last name is missing');
  if (!validators.isValidBirthday(userInfo.birthday)) errors.push('Birthday cannot be later than today');

  if (errors.length > 0) {
    res.status(400).render('users/edit_profile', { user: currentUser, displayProfile: true, profileErrors: errors });
  } else {
    try {
      const updatedUser = await users.updateUser(req.session.user._id, userInfo);
      req.session.user = {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      };
      res.render('users/update_success');
    } catch (e) {
      res.sendStatus(500);
    }
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
    validators.isValidUserId(req.params.id);
    const user = await users.getUserById(req.params.id);
    const artworksByUserId = await artworks.getArtWorksByUserId(req.params.id);
    res.render('portfolios/portfolio', { artworks: artworksByUserId, user: user, authenticated: false });
  } catch (e) {
    res.status(404);
  }
});

router.post('/changeuserpic', upload.single('image'), async (req, res) => {
  if (!req.session.user) {
    res.redirect('users/login');
  } else {
    let image;
    if (req.file) {
      image = await data.pictures.createPicture(
        (picData = await fs.readFile(path.join(__dirname, '..', 'uploads', req.file.filename))),
        (contentType = req.file.mimetype)
      );
      const currentUserId = req.session.user._id;
      validators.isValidUserId(currentUserId);
      try {
        await users.updateUser(currentUserId, { userPictureId: image._id });
        res.redirect('/users/edit');
      } catch (e) {
        res.status(500);
      }
    }
  }
});

router.patch('/updatepassword', async (req, res) => {
  if (!req.session.user) {
    res.redirect('users/login');
    return;
  }
  validators.isValidUserId(req.session.user._id);
  const user = await users.getUserById(req.session.user._id);
  const { currentPassword, newPassword, newPassword2 } = req.body;

  const errors = [];

  if (!validators.isNonEmptyString(currentPassword)) errors.push('Current Password is missing');
  if (!validators.isNonEmptyString(newPassword)) errors.push('New Password is missing');
  if (!validators.isNonEmptyString(newPassword2)) errors.push('Second New Password is missing');
  if (!validators.isValidPassword(newPassword)) errors.push('New password not meeting requirement');
  if (newPassword !== newPassword2) errors.push('New Password and confirmation do not match');

  if (errors.length > 0) {
    res.status(400).render('users/edit_profile', { user: user, passwordErrors: errors });
  } else {
    if (user && (await bcrypt.compare(currentPassword, user.hashedPassword))) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await users.updateUser(user._id, { hashedPassword: newHashedPassword });
      res.render('users/update_success');
    } else {
      res.status(400).render('users/edit_profile', {
        user: user,
        displayProfile: false,
        passwordErrors: ['Current Password is not correct'],
      });
    }
  }
});

module.exports = router;

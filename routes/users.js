const express = require('express');
const router = express.Router();
const data = require('../data');
const artworks = data.artworks;
const validators = data.validators;
const users = data.users;
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const xss = require('xss');

// private page for user to see his/her own profile
router.get('/profile', async (req, res) => {
  if (!req.session.user) {
    res.render('home/access_denied', { title: 'Access Denied' });
    return;
  }
  try {
    validators.isNonEmptyString(req.session.user._id);
    const singleUser = await users.getUserById(req.session.user._id);
    const artworksByUserId = await artworks.getArtWorksByUserId(req.session.user._id);
    res.render('portfolios/portfolio', {
      user: singleUser,
      artworks: artworksByUserId,
      authenticated: true,
      title: 'Profile',
    });
  } catch (e) {
    res.status(500).json({ error: 'Fail to retrieve profile' });
  }
});

router.get('/register', async (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  }
  res.render('users/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const errors = [];
  const { firstName, lastName, gender, email, password, passwordConfirm } = req.body;
  if (!data.validators.isLettersOnly(firstName)) errors.push('First name is missing');
  if (!data.validators.isLettersOnly(lastName)) errors.push('Last name is missing');
  if (!data.validators.isNonEmptyString(gender)) errors.push('Gender is missing');
  else if (!data.validators.validateGender(gender)) errors.push('Gender provided is invalid');
  if (!data.validators.isNonEmptyString(email)) errors.push('Email address is missing');
  else if (!data.validators.isValidEmail(email)) errors.push('The provided emails is incorrect');
  if (!data.validators.isNonEmptyString(password)) errors.push('Password is missing');
  else if (!data.validators.isValidPassword(password)) errors.push('Password must be at least of length 8');
  if (!data.validators.isNonEmptyString(passwordConfirm)) errors.push('Password confirmation is missing');
  if (password !== passwordConfirm) errors.push("Password and confirmation don't match");

  const hashedPassword = await bcrypt.hash(password, 10);
  let user = {
    firstName: xss(firstName),
    lastName: xss(lastName),
    email: xss(email.toLowerCase()),
    hashedPassword,
    gender: xss(gender),
  };

  if (errors.length > 0) {
    res.status(400).render('users/register', { errors, user, title: 'Register' });
  } else {
    try {
      const existingUser = await users.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        res
          .status(400)
          .render('users/register', { errors: ['This email address is already used.'], user, title: 'Register' });
      } else {
        user = await users.createUser(user);
        res.render('users/reg_success', { user, title: 'Register Success' });
      }
    } catch (e) {
      res.status(500).render('users/register', { errors: [e], user, title: 'Register' });
    }
  }
});

router.get('/login', async (req, res) => {
  if (req.session.user) {
    res.redirect('/');
  }
  res.render('users/login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  if (!data.validators.isNonEmptyString(email)) errors.push('Email address is missing');
  if (!data.validators.isNonEmptyString(password)) errors.push('Password is missing');

  if (errors.length > 0) {
    res.status(400).render('users/login', { errors, email, title: 'Login' });
  } else {
    const user = await users.getUserByEmail(email.toLowerCase());
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      req.session.user = { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName };
      res.redirect('/');
    } else {
      res.status(400).render('users/login', { errors: ['Email or Password is incorrect'], email, title: 'Login' });
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
    res.render('home/access_denied', { title: 'Access Denied' });
    return;
  }
  validators.isNonEmptyString(req.session.user._id);
  const singleUser = await users.getUserById(req.session.user._id);
  res.render('users/edit_profile', {
    user: singleUser,
    displayProfile: true,
    today: Date.now(),
    title: 'Edit Profile',
  });
});

// Validated user to update information
router.patch('/updateprofile', async (req, res) => {
  if (!req.session.user) {
    res.render('home/access_denied', { title: 'Access Denied' });
    return;
  }
  validators.isValidUserId(req.session.user._id);
  const currentUser = await users.getUserById(req.session.user._id);

  const { firstName, lastName, address, gender, birthday, websiteUrl, socialMedia, biography } = req.body;
  let birthday_date;
  if (birthday) {
    birthday_date = new Date(xss(birthday));
  } // convert string to date

  const errors = [];
  // first name and last name are required
  if (!validators.isLettersOnly(firstName)) errors.push('First name is not valid');
  if (!validators.isLettersOnly(lastName)) errors.push('Last name is not valid');
  if (birthday_date && !validators.isValidBirthday(birthday_date)) errors.push('Birthday cannot be later than today');
  if (gender && !validators.validateGender(gender)) errors.push('Please choose a gender in the given category');
  if (websiteUrl && !validators.isValidURL(websiteUrl)) errors.push('The provided personal website is not valid');
  if (socialMedia) {
    if (socialMedia.instagram && !validators.isValidURL(socialMedia.instagram))
      errors.push('Instagram Link is not valid');
    if (socialMedia.twitter && !validators.isValidURL(socialMedia.twitter)) errors.push('Twitter Link is not valid');
    if (socialMedia.linkedIn && !validators.isValidURL(socialMedia.linkedIn)) errors.push('LinkedIn Link is not valid');
    if (socialMedia.facebook && !validators.isValidURL(socialMedia.facebook)) errors.push('Facebook Link is not valid');
  }

  if (errors.length > 0) {
    res.status(400).render('users/edit_profile', {
      user: currentUser,
      displayProfile: true,
      profileErrors: errors,
      title: 'Edit Profile',
    });
  } else {
    try {
      let newAddress = {};
      if (address.streetAddress) newAddress.streetAddress = xss(address.streetAddress);
      if (address.city) newAddress.city = xss(address.city);
      if (address.state) newAddress.state = xss(address.state);
      if (address.zipCode) newAddress.zipCode = xss(address.zipCode);
      if (address.country) newAddress.country = xss(address.country);

      let newSocialMedia = {};
      if (socialMedia.instagram) newSocialMedia.instagram = xss(socialMedia.instagram);
      if (socialMedia.twitter) newSocialMedia.twitter = xss(socialMedia.twitter);
      if (socialMedia.linkedIn) newSocialMedia.linkedIn = xss(socialMedia.linkedIn);
      if (socialMedia.facebook) newSocialMedia.facebook = xss(socialMedia.facebook);

      let userInfo = {
        firstName: xss(firstName),
        lastName: xss(lastName),
        gender: xss(gender),
        websiteUrl: xss(websiteUrl),
        biography: xss(biography),
        birthday: birthday_date,
        address: newAddress,
        socialMedia: newSocialMedia,
      };

      const updatedUser = await users.updateUser(req.session.user._id, userInfo);
      req.session.user = {
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      };
      res.render('users/update_success', { content: 'profile', title: 'Profile Update Success' });
    } catch (e) {
      res.status(500).render('users/edit_profile', {
        user: currentUser,
        displayProfile: true,
        profileErrors: [e],
        title: 'Edit Profile',
      });
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
    res.render('portfolios/portfolio', {
      artworks: artworksByUserId,
      user: user,
      authenticated: false,
      title: 'Artfolio',
    });
  } catch (e) {
    res.status(404).json({ error: 'Portfolio not found' });
  }
});

router.post('/changeuserpic', upload.single('image'), async (req, res) => {
  if (!req.session.user) {
    res.render('home/access_denied');
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
        res.status(500).json({ error: 'Fail to update photo' });
      }
    }
  }
});

router.patch('/updatepassword', async (req, res) => {
  if (!req.session.user) {
    res.render('home/access_denied', { title: 'Access Denied' });
    return;
  }
  validators.isValidUserId(req.session.user._id);
  const user = await users.getUserById(req.session.user._id);
  const { currentPassword, newPassword, confirmPassword } = req.body;

  const errors = [];

  if (!validators.isNonEmptyString(currentPassword)) errors.push('Current Password is missing');
  if (!validators.isNonEmptyString(newPassword)) errors.push('New Password is missing');
  if (!validators.isNonEmptyString(confirmPassword)) errors.push('Second New Password is missing');
  if (!validators.isValidPassword(newPassword)) errors.push('New password not meeting requirement');
  if (newPassword !== confirmPassword) errors.push('New Password and confirmation do not match');

  if (errors.length > 0) {
    res.status(400).render('users/edit_profile', { user: user, passwordErrors: errors, title: 'Edit Profile' });
  } else {
    if (user && (await bcrypt.compare(currentPassword, user.hashedPassword))) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await users.updateUser(user._id, { hashedPassword: newHashedPassword });
      res.render('users/update_success', { content: 'password', title: 'Profile Update Success' });
    } else {
      res.status(400).render('users/edit_profile', {
        user: user,
        displayProfile: false,
        passwordErrors: ['Current Password is not correct'],
        title: 'Edit Profile',
      });
    }
  }
});

module.exports = router;

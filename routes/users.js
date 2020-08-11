const express = require('express');
const router = express.Router();
const data = require('../data');
const artworks = data.artworks;
const pictures = data.pictures;
const validators = data.validators;
const users = data.users;

router.get('/login', async (req, res) => {
  res.render('users/login', { hasError: false });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await users.getUserByEmail(email);
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
    res.redirect('/users/private');
  } else {
    res.status(401).render('users/login', { hasError: true, error: 'Email/Password not match, try again' });
  }
});

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
router.get('/private', async (req, res) => {
  try {
    const singleUser = await userData.getUserById(req.session.user._id);
    res.render('users/single', { user: singleUser });
  } catch (e) {
    res.status(500).send();
  }
});

// private page for user to edit his/her own profile
router.get('/edit', async (req, res) => {
  //const user = await userData.getUserById(req.session.user._id);
  //res.render('users/editprofile', { user: user });
  res.render('users/editprofile');
});

router.post('/', async (req, res) => {
  const newUserData = req.body;
  // to-do basic check
  try {
    const newUser = await users.createUser(newUserData);
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
    let pics = [];

    for (let i = 0; i < artworksByUserId.length; i++) {
      let artwork = artworksByUserId[i];
      const pic = await pictures.getPicturesByArtworkId(artwork._id);
      const firstPic = pic[0];
      firstPic['artworkTitle'] = artwork.title;
      // only choose the first picture to display
      pics.push(firstPic);
    }
    res.render('portfolios/index', { pics: pics, user: user });
  } catch (e) {
    res.status(404).render('portfolios/index');
  }
});
module.exports = router;

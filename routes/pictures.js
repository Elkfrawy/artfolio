const express = require('express');
const router = express.Router();
const data = require('../data');
const path = require('path');
const validators = require('../data/validators');

router.get('/content/:id', async (req, res) => {
  if (req.params.id === 'undefined') {
    res.redirect('/pictures/content');
    return;
  }
  if (!validators.isNonEmptyString(req.params.id)) {
    res.status(400, { errors: ['Must provide non-empty string for picture id'] });
    return;
  }
  try {
    const picture = await data.pictures.getPictureById(req.params.id);
    res.contentType(picture.contentType);
    res.send(picture.data);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.get('/content/', async (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'img', 'default_profile.jpeg'));
});

router.get('/user/:id', async (req, res) => {
  if (!validators.isNonEmptyString(req.params.id)) {
    res.status(400, { errors: ['Must provide non-empty string for userId'] });
    return;
  }

  try {
    const user = await data.users.getUserById(req.params.id);
    res.redirect(`/pictures/content/${user.userPictureId}`);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;

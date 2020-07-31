const express = require('express');
const router = express.Router();
const data = require('../data');
const upload = require('../config/upload');
var path = require('path');
const fs = require('fs').promises;

router.get('/', async (req, res) => {
  res.render('playground');
});

router.post('/user', upload.single('image'), async (req, res, next) => {
  let image;
  if (req.file) {
    image = await data.pictures.createPicture(
      (picData = await fs.readFile(path.join(__dirname, '..', 'uploads', req.file.filename))),
      (contentType = req.file.mimetype)
    );
  }

  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    hashedPassword: req.body.password, // TODO Hash the password here
    userPictureId: image._id,
  };

  user = await data.users.createUser(user);
  res.render('playground', { user });
});

router.post('/artwork', upload.array('image'), async (req, res, next) => {
  let artwork = await data.artworks.createArtwork(
    req.body.title,
    req.body.description,
    req.body.category,
    req.body.createDate,
    req.body.userId
  );
  let pics = [];
  if (req.files) {
    for (let i = 0; i < req.files.length; i++) {
      let file = req.files[i];
      let pic = await data.pictures.createPicture(
        (picData = await fs.readFile(path.join(__dirname, '..', 'uploads', file.filename))),
        (contentType = file.mimetype),
        (artworkId = artwork._id)
      );
      pics.push(pic);
    }
  }

  res.render('playground', { pics });
});

module.exports = router;

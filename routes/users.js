const express = require('express');
const router = express.Router();
const data = require('../data');
const upload = require('../config/upload');
var path = require('path');
const { response } = require('express');

router.get('/users', async (req, res) => {
  res.send(200);
});

router.post('/', upload.single('image'), async (req, res, next) => {
  let image;
  if (req.file) {
    image = await data.pictures.createPicture(
      (fileUrl = path.join(__dirname, '..', 'uploads', req.file.filename)),
      (contentType = 'image/png')
    );
  }

  var user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    hashedPassword: req.body.password, // TODO Hash the password here
    userPictureId: image._id,
  };

  data.users.createUser(user);
  res.render('playground', { user });
});

module.exports = router;

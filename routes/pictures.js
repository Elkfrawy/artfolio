const express = require('express');
const router = express.Router();
const data = require('../data');
const upload = require('../config/upload');
var path = require('path');

router.get('/:id', async (req, res) => {
  const picture = await data.pictures.getPictureById(req.params.id);
  res.json(picture);
});

router.get('/content/:id', async (req, res) => {
  const picture = await data.pictures.getPictureById(req.params.id);
  res.contentType(picture.contentType);
  res.send(picture.data);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const data = require('../data');
const upload = require('../config/upload');
var path = require('path');
const { response } = require('express');

router.get('/', async (req, res) => {
  res.render('playground');
});

module.exports = router;

const express = require('express');
const router = express.Router();
const data = require('../data');
const upload = require('../config/upload');
var path = require('path');
var fs = require('fs').promises;

router.get('/users', async (req, res) => {
  res.send(200);
});

module.exports = router;

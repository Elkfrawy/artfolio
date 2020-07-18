const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/users', async (req, res) => {
  res.send(200);
});

module.exports = router;

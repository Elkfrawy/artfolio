const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', async (req, res) => {
  res.render('home/home', { title: 'Artfolio, share your art portfolio with the world!' });
});

module.exports = router;

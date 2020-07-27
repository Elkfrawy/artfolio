const express = require('express');
const router = express.Router();
const data = require('../data');

router.get('/', async (req, res) => {
  const artworks = await data.artworks.getArtworksByUsername('ayman');
  res.render('home/home', {
    title: 'Artfolio, share your art portfolio with the world!',
    artworks,
  });
});

module.exports = router;

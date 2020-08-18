const express = require('express');
const router = express.Router();
const data = require('../data');
const artworksData = data.artworks;

router.get('/', async (req, res) => {
  const sections = [
    {
      title: 'New artworks',
      artworks: await artworksData.getRecentlyAddedArtworks(),
    },
    {
      title: 'Popular artworks',
      artworks: await artworksData.getArtworksByViews(),
    },
    {
      title: 'Recently visited artworks',
      artworks: await artworksData.getRecentlyVisitedArtworks(),
    },
  ];

  res.render('home/home', {
    title: 'Artfolio, share your art portfolio with the world!',
    sections,
  });
});

module.exports = router;

// const mongoCollections = require('../config/mongoCollections');
const models = require('../models');

async function getArtworksByCategory(category) {
  const artworksCollection = await artworks();
  return await artworksCollection.find({ category });
}

async function createArtwork(title, description, category, createDate, userId, pictures) {
  const newArtwork = new models.Artwork({
    title,
    description,
    category,
    createDate,
    userId,
    pictures,
    comments: [],
    userId,
    numberOfViews: 0,
    lastView: Date.now(),
    postDate: Date.now(),
  });
  await newArtwork.save();
}

async function getArtworksByKeyword(keyword) {}

async function getArtworksByUsername(username) {}

async function getArtworksByViews() {}

async function getRecentlyVisitedArtworks() {}

module.exports = { getArtworksByCategory, createArtwork };

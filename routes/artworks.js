const express = require('express');
const router = express.Router();
const data = require('../data');
const artworkData = data.artworks;
const userData = data.users;
const pictureData = data.pictures;
const validatorData = data.validators;
const upload = require('../config/upload');
var path = require('path');
const fs = require('fs').promises;


router.get('/', async (req, res) => {
  try {
    //const users = await userData.getAllUsers();
    const artworksList = await artworkData.getAllArtWorks();
    res.render('artworks/all', { artworks: artworksList});
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artwork = await artworkData.getArtworkById(req.params.id);
    const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
    res.render('artworks/displaySingle', { artwork, pictures});
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/create', async(req, res) => {
  //authentication check 
  try{
    res.render('artworks/createSingle');
  }catch (e) {
    res.status(500).send();
  }
});


router.post('/create', async (req, res) => {

  const {title, description, createDate, category} = req.body;
  //const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
  const errors =[]; 
  if (!validatorData.isNonEmptyString(title)) {
     error.push('Missing artwork title'); 
  }
  if (!validatorData.isNonEmptyString(description)) {
     error.push('Missing artwork description'); 
  }
  if (!createDate) {
     error.push('Missing artwork creation date'); 
  }
  if (!validatorData.isNonEmptyString(category)) {
     error.push('Missing artwork category'); 
  }

  const user = await userData.getUserById(req.params.id);
  const userId = user._id;
  const username = `${user.firstName},${user.lastName}`; 
  

  let artwork = {title, description, createDate, category, userId, username};
  if(errors.length > 0){
    res.status(400).render('artworks/createSingle', {artwork, errors});
  }else{
    try {
    const existingArtwork = await artworkData.getArtWorkByTitle(title);
    if(existingArtwork){
      res.status(400).render('artworks/createSingle', { errors: ['Artwork title is already being used'],  artwork});
    }else{
    const newArtwork = await artworkData.createArtwork(artwork);
    let pictures = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          let file = req.files[i];
          let pic = await pictureData.createPicture(
            (picData = await fs.readFile(path.join(__dirname, '..', 'uploads', file.filename))),
            (contentType = file.mimetype),
            (artworkId = newArtwork._id)
          );
          pictures.push(pic);
        }
      }
    res.render('artwork/DisplaySingle', {artwork: newArtwork, pictures: pictures});
    }
  } catch (e) {
    res.status(500).render('artworks/CreateSingle', {errors: [e], artwork});
  }
  }
  
});

router.put('/:id', async (req, res) => {
  try {
    await artworkData.getArtworkById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Artwork not found' });
    return;
  }

  const artworkInfo = req.body;
  if (
    !artworkInfo.title ||
    !artworkInfo.description ||
    !artworkInfo.category ||
    !artworkInfo.createDate ||
    !artworkInfo.numberOfViews ||
    !artworkInfo.lastView
  ) {
    res.status(400).json({ error: 'You must Supply All fields' });
    return;
  }

  try {
    const updatedArtwork = await artworkData.updateArtwork(req.params.id, artworkInfo);
    res.redirect(`/artworks/${updatedArtwork._id}`);
  } catch (e) {
    res.sendStatus(500);
  }
});

router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  try {
    const oldArtwork = await artworkData.getArtworkById(req.params.id);

    if (requestBody.title && requestBody.title !== oldArtwork.title) updatedObject.title = requestBody.title;

    if (requestBody.description && requestBody.description !== oldArtwork.description)
      updatedObject.description = requestBody.description;

    if (requestBody.category && requestBody.category !== oldArtwork.category)
      updatedObject.category = requestBody.category;

    if (requestBody.createDate && requestBody.createDate !== oldArtwork.createDate)
      updatedObject.createDate = requestBody.createDate;

    if (requestBody.numberOfViews && requestBody.numberOfViews !== oldArtwork.numberOfViews)
      updatedObject.numberOfViews = requestBody.numberOfViews;

    if (requestBody.lastView && requestBody.lastView !== oldArtwork.lastView)
      updatedObject.lastView = requestBody.lastView;

    //NOT included: username, userId, pictures
  } catch (e) {
    res.status(404).json({ error: 'Artwork not found' });
    return;
  }

  try {
    const updatedArtwork = await artworkData.updateArtwork(req.params.id, updatedObject);
    res.redirect(`/artworks/${updatedArtwork._id}`);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await artworkData.getArtworkById(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Artwork not found' });
    return;
  }

  try {
    await artworkData.deleteArtwork(req.params.id);
    //return to portfolio page
    res.sendStatus(200);
  } catch (e) {
    res.Status(500);
  }
});

module.exports = router;

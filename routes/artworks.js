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
        res.status(500).send("No Artwork with that ID found");
      } 
});

//routes problem: cant use /new routes, redirects to /:id rotues for some reason
//solution: /... will automatically be interpreted as an id, use /.../..
router.get('/create/new', async(req, res) => {
  if(!req.session.user){
    res.redirect('users/login');
  }else{
    try{
      res.render('artworks/createSingle');
    }catch (e){
      res.status(500).send();
    }
  }
});

router.post('/create/new', upload.array('image'), async (req, res) => {

  const {title, description, createDate, category} = req.body;

  const errors =[]; 
  if (!validatorData.isNonEmptyString(title)) {
     errors.push('Missing artwork title'); 
  }
  if (!validatorData.isNonEmptyString(description)) {
     errors.push('Missing artwork description'); 
  }
  if (!createDate) {
     errors.push('Missing artwork creation date'); 
  }
  if (!validatorData.isNonEmptyString(category)) {
     errors.push('Missing artwork category'); 
  }

  const user = await userData.getUserById(req.session.user._id);
  const userId = req.session.user._id;
  console.log(userId);
  //const username = `${user.firstName},${user.lastName}`;  
  
  let newArtwork = {title, description,category, createDate, userId:userId};

  if(errors.length > 0){
    res.status(400).render('artworks/createSingle', {errors});
  }else{
    try {
    newArtwork = await artworkData.createArtwork(newArtwork);

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
    return res.render('artworks/DisplaySingle', {artwork: newArtwork, pictures: pictures});
  } catch (e) {
    res.status(500).render('artworks/CreateSingle', {errors: [e]});
  }
  }
});

//fedde93e-e0e4-4822-87c5-fd5b39909e26

router.get('/edit/:id', async(req,res)=>{ 

  if(req.session.user){
    try {
    const artwork = await artworkData.getArtworkById(req.params.id);
    const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
    res.render('artworks/editSingle', { artwork, pictures}); 
    }catch (e) {
    res.status(500).send("No Artwork with that ID exists for editing");
  }
  }else{
  res.send("Can not edit this artwork, user not logged-in");
  }
});

router.post('/addimage/:id', upload.array('image'), async(req,res)=>{
  if (!req.session.user) {
    return res.redirect('users/login');
  } 

  let pictures = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          let file = req.files[i];
          let pic = await pictureData.createPicture(
            (picData = await fs.readFile(path.join(__dirname, '..', 'uploads', file.filename))),
            (contentType = file.mimetype),
            (artworkId = req.params.id) 
          );
          pictures.push(pic);
        }
      }
      try {
        res.redirect(`/artworks/edit/${req.params.id}`);
      } catch (e) {
        res.status(500);
      }
});

router.post('/deleteimage/:id', async(req,res) =>{
  if (!req.session.user) {
    return res.redirect('users/login');
  }
  const pic = await pictureData.getPictureById(req.params.id);
  const artworkId = pic.artworkId; 
  try{
    await pictureData.deletePicture(req.params.id); 
    return res.redirect(`/artworks/edit/${artworkId}`);
  }catch (e){
    res.send('error deleting picture');
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

// router.put('/:id', async (req, res) => {
//   try {
//     await artworkData.getArtworkById(req.params.id);
//   } catch (e) {
//     res.status(404).json({ error: 'Artwork not found' });
//     return;
//   }

//   const artworkInfo = req.body;
//   if (
//     !artworkInfo.title ||
//     !artworkInfo.description ||
//     !artworkInfo.category ||
//     !artworkInfo.createDate ||
//     !artworkInfo.numberOfViews ||
//     !artworkInfo.lastView
//   ) {
//     res.status(400).json({ error: 'You must Supply All fields' });
//     return;
//   }

//   try {
//     const updatedArtwork = await artworkData.updateArtwork(req.params.id, artworkInfo);
//     res.redirect(`/artworks/${updatedArtwork._id}`);
//   } catch (e) {
//     res.sendStatus(500);
//   }
// });

module.exports = router;

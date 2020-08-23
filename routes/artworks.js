const express = require('express');
const router = express.Router();
const data = require('../data');
const artworkData = data.artworks;
const userData = data.users;
const pictureData = data.pictures;
const upload = require('../config/upload');
var path = require('path');
const fs = require('fs').promises;
const validators = require('../data/validators');
const xss = require('xss');

router.get('/', async (req, res) => {
  try {
    const artworksList = await artworkData.getAllArtWorks();
    res.render('artworks/all', { artworks: artworksList });
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/search', async (req, res) => {
  try {
    if (!validators.isNonEmptyString(req.query.query)) {
      res.status(400).render('home/search', { error: 'You must provide a query to search with' });
    } else {
      const artworks = await artworkData.getArtworksByAny(req.query.query);
      res.render('home/search', { artworks, emptyMessage: "Couldn't find any artworks for the given keyword!" });
    }
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

//routes problem: cant use /new routes, redirects to /:id rotues for some reason
//solution: /... will automatically be interpreted as an id, use /.../..
//put get id route last
router.get('/create', async (req, res) => {
  if (!req.session.user) {
    res.redirect('/users/login');
  } else {
    try {
      res.render('artworks/createSingle', { title: 'Creating new artwork' });
    } catch (e) {
      res.status(500).send();
    }
  }
});

router.post('/create', upload.array('image'), async (req, res) => {
  var { title, description, createDate, category } = req.body;

  title = xss(title);
  description = xss(description);
  category = xss(category);
  
  const errors = [];
  if (!validators.isNonEmptyString(title)) {
    errors.push('Missing artwork title');
  }
  if (!validators.isNonEmptyString(description)) {
    errors.push('Missing artwork description');
  }
  if (!createDate) {
    errors.push('Missing artwork creation date');
  }
  if (!validators.isNonEmptyString(category)) {
    errors.push('Missing artwork category');
  }

  const userId = req.session.user._id;
  //console.log(userId);

  let newArtwork = { title, description, category, createDate, userId: userId };

  if (errors.length > 0) {
    res.status(400).render('artworks/createSingle', { errors, artwork: newArtwork });
  } else {
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
      return res.render('artworks/displaySingle', {
        userId: userId,
        artwork: newArtwork,
        pictures: pictures,
        title: `Artwork ${newArtwork.title}`,
      });
    } catch (e) {
      res.status(500).render('artworks/createSingle', { errors: [e], title: 'Creating new artwork' });
    }
  }
});

router.get('/edit/:id', async (req, res) => {
  if (req.session.user) {
    try {
      const userId = req.session.user._id;
      const artwork = await artworkData.getArtworkById(req.params.id);
      const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
      if(pictures.length == 1){
        res.render('artworks/editSingle', {
          artwork,
          pictures,
          userId,
          displayArtworkinfo: true,
          title: `Editing artwork ${artwork.title}`,
          lastPic : true});
      }else{
        res.render('artworks/editSingle', {
        artwork,
        pictures,
        userId,
        displayArtworkinfo: true,
        title: `Editing artwork ${artwork.title}`,
        lastPic: false,
      });
      }
    } catch (e) {
      res.status(500).send('No Artwork with that ID exists for editing');
    }
  } else {
    res.send('Can not edit this artwork, user not logged-in');
  }
});

router.post('/addimage/:id', upload.array('image'), async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/users/login');
  }

  let pictures = [];
  if (req.files) {
    ;
    for (let i = 0; i < req.files.length; i++) {
      let file = req.files[i];
      let pic = await pictureData.createPicture(
        (picData = await fs.readFile(path.join(__dirname, '..', 'uploads',  xss(file.filename)))),
        (contentType = file.mimetype),
        (artworkId = req.params.id)
      );
      pictures.push(pic);
    }
  }
  try {
    const artwork = await artworkData.getArtworkById(req.params.id);
    const userId = artwork.userId;
    const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
    //res.redirect(`/artworks/edit/${req.params.id}`);
    return res.render('artworks/editSingle', {
      userId,
      artwork,
      pictures,
      displayArtworkinfo: false,
      title: `Editing artwork ${artwork.title}`,
    });
  } catch (e) {
    res.status(500);
  }
});

router.post('/deleteimage/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('users/login');
  }
  const pic = await pictureData.getPictureById(req.params.id);
  const artworkId = pic.artworkId;

  const artwork = await artworkData.getArtworkById(artworkId);
  const userId = artwork.userId;

  try {
    await pictureData.deletePicture(req.params.id);
    const pictures = await pictureData.getPicturesByArtworkId(artworkId);
    //return res.redirect(`/artworks/edit/${artworkId}`);
    return res.render('artworks/editSingle', {
      userId,
      artwork,
      pictures,
      displayArtworkinfo: false,
      title: `Editing artwork ${artwork.title}`,
    });
  } catch (e) {
    res.send('error deleting picture');
  }
});

router.post('/changeImageTitle/:id', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('users/login');
  }
  const pic = await pictureData.getPictureById(req.params.id);
  const artworkId = pic.artworkId;
  const newTitle = xss(req.body.title); 
  const artwork = await artworkData.getArtworkById(artworkId);
  const userId = artwork.userId;
  
  await pictureData.updatePictureTitle(req.params.id, newTitle);
  const pictures = await pictureData.getPicturesByArtworkId(artworkId);
  //return res.redirect(`/artworks/edit/${artworkId}`);
  return res.render('artworks/editSingle', {
    userId,
    artwork,
    pictures,
    displayArtworkinfo: false,
    title: `Editing artwork ${artwork.title}`,
  });
});

router.post('/likes/:id', async(req,res)=>{
  
  const artworkId = req.params.id;
  const userId = req.session.user._id;
  const user = await userData.getUserById(userId);
  const likedArtworks = user.likedArtworks;

  if(likedArtworks.includes(artworkId)){
    await userData.removeArtworkToLikes(userId,artworkId);
    await artworkData.decreaseLike(artworkId); 
  }else{
    await userData.appendArtworkToLikes(userId, artworkId);
    await artworkData.increaseLike(artworkId);
  }
  return res.redirect(`/artworks/${artworkId}`);
});

router.get('/:id', async (req, res) => {
  try {
    const artwork = await artworkData.getArtworkById(req.params.id);
    const userId = artwork.userId;
    const pictures = await pictureData.getPicturesByArtworkId(req.params.id);
    // Update views
    await artworkData.recordNewView(req.params.id);

    res.render('artworks/displaySingle', { artwork, pictures, userId, title: `Artwork ${artwork.title}` });
  } catch (e) {
    res.status(500).send('No Artwork with that ID found');
  }
});

router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  try {
    const oldArtwork = await artworkData.getArtworkById(req.params.id);

    if (requestBody.title && requestBody.title !== oldArtwork.title) 
      updatedObject.title = xss(requestBody.title);

    if (requestBody.description && requestBody.description !== oldArtwork.description)
      updatedObject.description = xss(requestBody.description);

    if (requestBody.category && requestBody.category !== oldArtwork.category)
      updatedObject.category = xss(requestBody.category);

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
    res.redirect('/users/profile');
  } catch (e) {
    res.status(500);
  }
});

router.post('/:id/comments/', async (req, res) => {
  try {
    const comment = xss(req.body.comment);
    const artworkId = req.params.id;
    if (!validators.isNonEmptyString(comment)) {
      res.status(400).json({ error: 'You must provide a comment text' });
      return;
    }
    if (!req.session.user) {
      res.status(403).json({ error: 'User is not logged in. Please login to post a comment.' });
      return;
    }
    if (!validators.isNonEmptyString(artworkId)) {
      res.status(400).json({ error: 'Comment must be associated with an artwork' });
      return;
    }
    const createdComment = await artworkData.createComment(req.session.user._id, artworkId, comment);
    res.status(200).json({ createdComment, artworkId });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.delete('/:id/comments/:commentId', async (req, res) => {
  const artworkId = req.params.id;
  const commentId = req.params.commentId;
  try {
    if (!validators.isNonEmptyString(artworkId)) {
      res.status(400).json({ error: 'You must provide the artworkId' });
      return;
    }
    if (!validators.isNonEmptyString(commentId)) {
      res.status(400).json({ error: 'You must provide the commentId' });
      return;
    }
    await artworkData.deleteComment(artworkId, commentId);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

module.exports = router;

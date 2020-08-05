const express = require('express');
const router = express.Router();
const data = require('../data');
const artworkData = data.artworks;;
const upload = require('../config/upload');
var path = require('path');


router.get('/', async (req, res) => {
    try {
      const artworksList = await artworkData.getAllArtWorks();
      res.render('artworks/all', { artworks: artworksList });
    } catch (e) {
      res.status(500).send();
    }
  });
  
  router.get('/:id', async (req, res) => {
    try {
      const artwork = await artworkData.getArtworkById(req.params.id);
      res.render('artworks/single', { artwork: artwork });
    } catch (e) {
      res.status(500).send();
    }
  });

  //'/:userid' correct usage?
  router.get('/:userid', async(req, res) =>{
        try{
            const artworks = await artworkData.getArtWorksByUserId(req.params.id);
            res.render('artworks/portfolio', {artworks: artworks});
        }catch (e) {
            res.status(500).send();
          }
   });


  router.post('/', async (req, res) => {
    const newArtworkData = req.body;
    if (!newArtworkData.title) {
        res.status(400).json({ error: 'You must provide Artwork title' });
        return;
      }
      if (!newArtworkData.description) {
        newArtworkData.description = ""; 
      }
      if (!newArtworkData.category) {
        newArtworkData.category = "";
      }
      if (!newArtworkData.createDate) {
        newArtworkData.createDate = "";
      }
      //user not entering id, getting id from somewhere else
      if (!newArtworkData.userId) {
        res.status(400).json({ error: 'You must provide userId' });
        return;
      }
      if (!newArtworkData.pictures) {
        newArtworkData.pictures = {};
      }
    try {    
      const {title, description, category, createDate, userId, pictures} = newArtworkData;
      const newArtwork = await artworkData.createArtwork(title, description, category, createDate, userId, pictures);
      res.redirect(`/artworks/${newArtwork._id}`);
    } catch (e) {
      res.status(500).send();
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
    if (!artworkInfo.title || !artworkInfo.description || !artworkInfo.category || !artworkInfo.createDate || !artworkInfo.numberOfViews || !artworkInfo.lastView) {
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
  
  router.patch('/:id', async( req, res) =>{
      const requestBody = req.body;
      let updatedObject ={}; 
      try {
        const oldArtwork = await artworkData.getArtworkById(req.params.id);

        if (requestBody.title && requestBody.title !== oldArtwork.title)
          updatedObject.title = requestBody.title;
          
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
        //numberOfViews, lastView not present when artwork is created

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

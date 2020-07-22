const mongoCollections = require('./config/mongoCollections');
const artworks = mongoCollections.artworks;
const users = require('./users');
const uuid = require('uuid/v4');

//pictures and comments collection?

let exportFunctions ={

    async getArtworkById(id){
        if (!id) throw 'You must provide an id to search for';
        const artworksCollection = await artworks();
        const artwork = await artworksCollection.findOne({_id:id});
        if (artwork === null) throw 'No artwork with that id';

        return artwork;
    },

     async getArtWorksByUserId(userId){
        const artworksCollection = await artworks();

        const artworksByUserList = await artworksCollection.findOne({userId: userId}).toArray();
    
        return artworksByUserList;
    },
    
    async getAllArtWorks(){
        const artworksCollection = await artworks();

        const artworksList = await artworksCollection.find({}).toArray();
    
        return artworksList;
    },

    async createArtwork(title, category, userId, description, postDate, createDate){
    if (!title) throw 'You must provide a title';
    if (!category) throw 'You must provide a category';
    if (!userId) throw 'You must provide a userId';
    if (!description) throw 'You must provide a description';
    if (!postDate) throw 'You must provide a postDate';
    if (!createDate) throw 'You must provide a createDate';

    const artworksCollection = await artworks();
    const userName = await users.getUserById(userId); 

    const newArtwork = {
        _id: uuid(),  
        title: title,
        category: category, 
        name: userName,
        userId: userId, // name and user id are duplicated  
        description: description,
        postDate: postDate,     //getDatePosted
        createDate: createDate,
        numberOfViews: 0,       
        LastView: postDate,     //to be changed later with functions i.e. getLastViewDate()
        pictures:{
            //id: 
            //title: 
            //content: getPicturesByArtWorkId(_id); 
        },
        comments:{
            //content: getCommentsByArtworkId(_id)
        }
    };
    const insertInfo = await artworksCollection.insertOne(newArtwork);
    if (insertInfo.insertedCount === 0) throw 'Could not add artwork';

    const newArtwork = await this.getArtworkById(insertInfo.insertedId);

    return newArtwork;

    },
    
    async updateArtwork(id, updatedArtwork){
        const artworksCollection = await artworks();
        const userName = await users.getUserById(userId); 

        const updatedArtworksData = {};

    if (updatedArtwork.title) {
        updatedArtworksData.title = updatedArtwork.title;
    }
    if (updatedArtwork.category) {
        updatedArtworksData.category = updatedArtwork.category;
    }
    if (updatedArtwork.description) {
        updatedArtworksData.description = updatedArtwork.description;
    }
    if (updatedArtwork.createDate) {
        updatedArtworksData.createDate = updatedArtwork.createDate;
    }
    if (updatedArtwork.numberOfViews) {
        updatedArtworksData.numberOfViews = updatedArtwork.numberOfViews;
    }
    if (updatedArtwork.LastView) {
        updatedArtworksData.LastView = updatedArtwork.LastView;
    }
    //pictures & comments
    

    await artworksCollection.updateOne({ _id: id }, { $set: updatedArtworksData });

    return await this.getArtworkById(id);
  },
    
    async deleteArtwork(id){
        const artworksCollection = await artworks();
        let artwork = null;
        try {
          artwork = await this.getArtworkById(id);
        } catch (e) {
          console.log(e);
          return;
        }
        const deletionInfo = await artworksCollection.removeOne({ _id: id });
        if (deletionInfo.deletedCount === 0) {
          throw `Could not delete artwork with id of ${id}`;
        }
        //await users.removeArtworkFromUser(artwork_id, user_id);
        
        // removeArtworkFromUser
        // addArtworkToUser

        return true;
    },
    };
    module.exports = exportFunctions;
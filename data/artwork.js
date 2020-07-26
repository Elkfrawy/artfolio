const mongoCollections = require('./config/mongoCollections');
const artworks = mongoCollections.artworks;
const users = require('./users');
const uuid = require('uuid/v4');


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

    async createArtwork(title, category, userId, description, createDate){
    if (!title) throw 'You must provide a title';
    if (!category) throw 'You must provide a category';
    if (!userId) throw 'You must provide a userId';
    if (!description) throw 'You must provide a description';
    if (!postDate) throw 'You must provide a postDate';
    if (!createDate) throw 'You must provide a createDate';

    const artworksCollection = await artworks();
    const userObj = await users.getUserById(userId); 
    const userName = [userObj.firstName, userObj.lastName];

    const newArtwork = {
        _id: uuid(),  
        title: title,
        category: category, 
        name: userName,
        userId: userId,
        description: description,
        postDate: Date.now(),   
        createDate: createDate,
        numberOfViews: 0,       
        lastView: postDate,     //to be changed later with functions i.e. getLastViewDate()
        pictures:[ 
            //content: getPicturesByArtWorkId(_id); 
        ],
        comments:[
            //content: getCommentsByArtworkId(_id)
        ]
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
    if (updatedArtwork.lastView) {
        updatedArtworksData.lastView = updatedArtwork.lastView;
    }
    
    

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
    
    //Functions to add pictures & comments to artwork
    
    };
    module.exports = exportFunctions;
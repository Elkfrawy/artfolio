const models = require('../models');
const validators = require('./validators');

module.exports = {
  async createPicture(picData, contentType, artworkId = '', title = '', description = '') {
    let img = await models.Picture.create({ title, artworkId, description, contentType, data: picData });
    await img.save();
    return img;
  },

  async updatePictureTitle(id, newTitle) {
    if (!validators.isNonEmptyString(id)) throw 'Please provide an picture ID';
    if (!newTitle) throw 'Please provide an picture title to update with';

    const oldPicture = await models.Picture.findById(id).exec();
    if (!oldPicture) throw `There is no picture with that given ID: ${id}`;

   oldPicture.title = newTitle;
    
  return await saveSafely(oldPicture); // Save the the changes
  },


  async getPictureById(picId) {
    if (!validators.isNonEmptyString(picId)) throw 'Image ID must be non-empty string';

    const pic = models.Picture.findById(picId).exec();
    if (!pic) throw `Couldn't find a picture with the given ID: ${picId}`;

    return pic;
  },


  async deletePicture(picId) {
    if (!validators.isNonEmptyString(picId)) throw 'Image ID must be non-empty string';

    try {
      models.Picture.deleteOne({ _id: picId }).exec();
    } catch (e) {
      throw e.message();
    }
  },

  async getPicturesByArtworkId(artworkId) {
    if (!validators.isNonEmptyString(artworkId)) throw 'You must provide an artwork id';
    return await models.Picture.find({ artworkId }, '-data').exec();
  },

  async getPicturesByArtworkIds(artworkIds) {
    if (!validators.isArrayOfStrings(artworkIds)) throw 'You must provide an array of artwork id';
    return await models.Picture.find({ artworkId: { $in: artworkIds } }, '-data').exec();
  },
};
async function saveSafely(document) {
  try {
    return await document.save();
  } catch (e) {
    throw e.message; // Rethrow only the message instead of the whole stack trace
  }
}
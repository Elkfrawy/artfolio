const models = require('../models');
const validators = require('./validators');
var fs = require('fs');
var path = require('path');

module.exports = {
  async createPicture(fileUrl, contentType, title = '', description = '') {
    let img = await models.Picture.create({ title, description, contentType, data: fs.readFileSync(fileUrl) });
    await img.save();
    return img;
  },

  async getPictureById(picId) {
    if (!validators.isNonEmptyString(picId)) throw 'Image ID must be no empty string';

    const pic = models.Picture.findById(picId);
    if (!pic) throw `Couldn't find a picture with the given ID: ${picId}`;

    return pic;
  },
};

/*
CS546 WS - Final Project
Artfolio
*/

const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const users = data.users;
const artwork = data.artwork;

async function main() {
  const db = await dbConnection();

  await db.dropDatabase();

  let mirandaInfo = {
    firstName: 'Miranda',
    lastName: 'Zou',
    email: 'xzou3@stevens.edu',
    gender: 'Female',
    Address: {
      streetAddress: '20 1st Stt',
      city: 'Hoboken',
      state: 'NJ',
      zipCode: '07030',
      country: 'United States',
    },

    birthday: '01/01/1990',
    biography: 'Interested in color pencil',
  };

  let jackInfo = {
    firstName: 'Jack',
    lastName: 'Yang',
    email: 'yyang105@stevens.edu',
    gender: 'Male',
    Address: {
      streetAddress: '20 10st Stt',
      city: 'Hoboken',
      state: 'NJ',
      zipCode: '07030',
      country: 'United States',
    },

    birthday: '01/01/1998',
    biography: 'Interested in design',
  };

  let aymanInfo = {
    firstName: 'Ayman',
    lastName: 'Elkfrawy',
    email: 'Aelkfraw@stevens.edu',
    gender: 'Male',
    Address: {
      streetAddress: '20 15st Stt',
      city: 'Hoboken',
      state: 'NJ',
      zipCode: '07030',
      country: 'United States',
    },

    birthday: '01/01/1988',
    biography: 'Interested in oil painting',
  };

  mirandaInfo = await users.createUser(mirandaInfo);
  jackInfo = await users.createUser(jackInfo);
  aymanInfo = await users.createUser(aymanInfo);

  await artwork.createArtwork(
    'First artwork',
    'drawing',
    aymanInfo._id,
    'This is my first artwork ever!',
    Date.now,
    Date.now
  );

  await artwork.createArtwork('Web design', 'web', aymanInfo._id, 'Just a simple web site design!', Date.now, Date.now);

  drawingArtworks = await artwork.getArtworksByCategory('web');
  console.log(drawingArtworks);

  console.log('Done seeding database');
  await db.serverConfig.close();
}

main().catch((error) => {
  console.error(error);
  return dbConnection().then((db) => {
    return db.serverConfig.close();
  });
});

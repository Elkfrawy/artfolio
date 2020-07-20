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
}

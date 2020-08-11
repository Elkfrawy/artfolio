const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const artworks = data.artworks;
const users = data.users;
var path = require('path');
const bluebird = require('bluebird');
const fs = bluebird.promisifyAll(require('fs'));

async function main() {
  const conn = await dbConnection();
  await conn.dropDatabase();

  try {
    // let firstArtwork = await artworks.createArtwork(
    //   'My first artwork',
    //   'This was my first artwork ever!',
    //   'drawing',
    //   Date.now(),
    //   '23523523',
    //   []
    // );

    // await artworks.updateArtwork(firstArtwork._id, { title: 'A new title!' });

    // const artworksResult = await artworks.getArtworksByKeyword('bla');
    // console.log(artworksResult[0].title);

    let mirandaInfo = {
      firstName: 'Miranda',
      lastName: 'Zou',
      email: 'xzou3@stevens.edu',
      gender: 'Female',
      address: {
        streetAddress: '20 1st Stt',
        city: 'Hoboken',
        state: 'NJ',
        zipCode: '07030',
        country: 'United States',
      },
      hashedPassword: '111111',
      birthday: '01/01/1990',
      biography: 'Interested in color pencil',
      websiteUrl: 'https://www.stevens.edu',
    };

    let jackInfo = {
      firstName: 'Jack',
      lastName: 'Yang',
      email: 'yyang105@stevens.edu',
      gender: 'Male',
      address: {
        streetAddress: '20 10st Stt',
        city: 'Hoboken',
        state: 'NJ',
        zipCode: '07030',
        country: 'United States',
      },
      hashedPassword: '222222',
      birthday: '01/01/1998',
      biography: 'Interested in design',
    };

    let aymanInfo = {
      firstName: 'Ayman',
      lastName: 'Elkfrawy',
      email: 'Aelkfraw@stevens.edu',
      gender: 'Male',
      address: {
        streetAddress: '20 15st Stt',
        city: 'Hoboken',
        state: 'NJ',
        zipCode: '07030',
        country: 'United States',
      },

      hashedPassword: '333333',
      birthday: '01/01/1988',
      biography: 'Interested in oil painting',
    };

    const miranda = await users.createUser(mirandaInfo);
    await users.createUser(jackInfo);
    await users.createUser(aymanInfo);

    let artworkAnimals = await artworks.createArtwork(
      'Animals',
      'Cute Animals',
      'Color Pencil',
      new Date('08/10/2020'),
      miranda._id
    );

    //upload animals
    var directory = path.join(__dirname, '.', 'seedPictures/animals');
    var files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'jpg'),
        (artworkId = artworkAnimals._id)
      );
    }

    //upload plants
    let artworkPlants = await artworks.createArtwork(
      'Plants',
      'Various Plants',
      'Color Pencil',
      new Date('08/10/2020'),
      miranda._id
    );
    directory = path.join(__dirname, '.', 'seedPictures/plants');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'jpg'),
        (artworkId = artworkPlants._id)
      );
    }

    console.log('Done seeding database');
    await conn.close();
  } catch (e) {
    console.log(e);
  }
}

main();

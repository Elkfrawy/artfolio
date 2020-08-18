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

    let userPicDir = path.join(__dirname, '.', 'seedPictures/userPicture');
    const mirandaPic = await data.pictures.createPicture(
      (picData = await fs.readFileAsync(path.join(userPicDir, 'miranda.jpg'))),
      (contentType = 'jpg')
    );
    const jackPic = await data.pictures.createPicture(
      (picData = await fs.readFileAsync(path.join(userPicDir, 'jack.png'))),
      (contentType = 'png')
    );
    const aymanPic = await data.pictures.createPicture(
      (picData = await fs.readFileAsync(path.join(userPicDir, 'ayman.jpg'))),
      (contentType = 'jpg')
    );

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
      hashedPassword: '$2b$10$FcmXEbDdgdRLJRXp1Vh/juUlP/.xE89XCZZ8jrHoR57/Wea2E/hXO',
      birthday: '01/01/1990',
      biography: 'Interested in color pencil',
      websiteUrl: 'https://www.stevens.edu',
      userPictureId: mirandaPic._id,
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
      hashedPassword: '$2b$10$FcmXEbDdgdRLJRXp1Vh/juUlP/.xE89XCZZ8jrHoR57/Wea2E/hXO',
      birthday: '01/01/1998',
      biography: 'Interested in design',
      userPictureId: jackPic._id,
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

      hashedPassword: '$2b$10$FcmXEbDdgdRLJRXp1Vh/juUlP/.xE89XCZZ8jrHoR57/Wea2E/hXO',
      birthday: '01/01/1988',
      biography: 'Interested in oil painting',
      userPictureId: aymanPic._id,
    };

    const miranda = await users.createUser(mirandaInfo);
    const jack = await users.createUser(jackInfo);
    const ayman = await users.createUser(aymanInfo);

    let artworkAnimals = await artworks.createArtwork(
      'Animals',
      'Cute Animals',
      'Color Pencil',
      new Date('08/10/2020'),
      miranda._id
    );

    let directory;
    let files;
    // upload animals
    directory = path.join(__dirname, '.', 'seedPictures/animals');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkAnimals._id),
        (title = 'Animal')
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
        (contentType = 'image/jpeg'),
        (artworkId = artworkPlants._id)
      );
    }

    //upload fruits
    let artworkFruits = await artworks.createArtwork(
      'Fruits',
      'Nice fruits',
      'Oil Painting',
      new Date('08/10/2020'),
      jack._id
    );
    directory = path.join(__dirname, '.', 'seedPictures/fruits');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkFruits._id)
      );
    }

    //upload scenary
    let artworkScenary = await artworks.createArtwork(
      'Scenary',
      'Beatiful places',
      'Acrylic',
      new Date('08/10/2020'),
      ayman._id
    );
    directory = path.join(__dirname, '.', 'seedPictures/scenary');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkScenary._id)
      );
    }

    //upload architecture
    let artworkArchitect = await artworks.createArtwork(
      'Architecture',
      'Architecture around world',
      'Sketch',
      new Date('08/10/2020'),
      ayman._id
    );
    directory = path.join(__dirname, '.', 'seedPictures/architecture');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkArchitect._id)
      );
    }

    let artworkCharacter = await artworks.createArtwork(
      'Character',
      'Cool girls',
      'Digital Art',
      new Date('08/11/2020'),
      miranda._id
    );
    directory = path.join(__dirname, '.', 'seedPictures/character');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkCharacter._id)
      );
    }

    console.log('Done seeding database');
    await conn.close();
  } catch (e) {
    console.log(e);
  }
}

main();

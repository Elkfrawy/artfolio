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
        streetAddress: '20 1st St',
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
      socialMedia: {
        linkedIn: 'https://www.linkedin.com/in/xianqing-miranda-zou-41993958/',
        facebook: 'https://www.facebook.com/xianqing.zou/',
        instagram: 'https://www.instagram.com/miranda.zou/',
      },
    };

    let jackInfo = {
      firstName: 'Jack',
      lastName: 'Yang',
      email: 'yyang105@stevens.edu',
      gender: 'Male',
      address: {
        streetAddress: '20 10st St',
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
      email: 'aelkfraw@stevens.edu',
      gender: 'Male',
      address: {
        streetAddress: '20 15st St',
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

    let artworkAnimals = await artworks.createArtwork({
      title: 'Animals',
      description: 'Cute Animals',
      category: 'Color Pencil',
      createDate: new Date('08/10/2020'),
      userId: miranda._id,
    });

    let directory;
    let files;
    //upload animals
    directory = path.join(__dirname, '.', 'seedPictures/animal');
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
    let artworkPlants = await artworks.createArtwork({
      title: 'Plants',
      description: 'Various Plants',
      category: 'Color Pencil',
      createDate: new Date('08/10/2020'),
      userId: miranda._id,
    });
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
    let artworkFruits = await artworks.createArtwork({
      title: 'Fruits',
      description: 'Nice fruits',
      category: 'Oil Painting',
      createDate: new Date('08/10/2020'),
      userId: jack._id,
    });
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
    let artworkScenary = await artworks.createArtwork({
      title: 'Scenary',
      description: 'Beatiful places',
      category: 'Acrylic',
      createDate: new Date('08/10/2020'),
      userId: ayman._id,
    });
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
    let artworkArchitect = await artworks.createArtwork({
      title: 'Architecture',
      description: 'Architecture around world',
      category: 'Sketch',
      createDate: new Date('08/10/2020'),
      userId: ayman._id,
    });
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

    let artworkCharacter = await artworks.createArtwork({
      title: 'Character',
      description: 'Cool girls',
      category: 'Digital Art',
      createDate: new Date('08/11/2020'),
      userId: miranda._id,
    });
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

    let artworkDress = await artworks.createArtwork({
      title: 'Dress',
      description: 'Dream Wedding',
      category: 'Sketch',
      createDate: new Date('08/11/2020'),
      userId: miranda._id,
    });
    directory = path.join(__dirname, '.', 'seedPictures/dress');
    files = fs.readdirSync(directory);
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      await data.pictures.createPicture(
        (picData = await fs.readFileAsync(path.join(directory, file))),
        (contentType = 'image/jpeg'),
        (artworkId = artworkDress._id)
      );
    }

    console.log('Done seeding database');
    await conn.close();
  } catch (e) {
    console.log(e);
  }
}

main();

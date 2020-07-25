const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const artworks = data.artworks;

async function main() {
  const conn = await dbConnection();
  await conn.dropDatabase();

  try {
    let firstArtwork = await artworks.createArtwork(
      'My first artwork',
      'This was my first artwork ever!',
      'drawing',
      Date.now(),
      '23523523',
      []
    );

    await artworks.updateArtwork(firstArtwork._id, { title: 'A new title!' });

    const artworksResult = await artworks.getArtworksByKeyword('bla');
    console.log(artworksResult[0].title);
  } catch (e) {
    console.log(e);
  }
}

main();

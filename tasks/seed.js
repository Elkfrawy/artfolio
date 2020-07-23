const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const artworks = data.artwork;

async function main() {
  const conn = await dbConnection();
  await conn.dropDatabase();

  await artworks.createArtwork(6236, 'This was my first artwork ever!', 'drawing', Date.now(), '23523523', []);
}

main();

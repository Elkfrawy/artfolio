const artworks = require('../data/artworks');
const database = require('../config/mongoConnection');

let conn;
beforeAll(async () => {
  conn = await database();
});

afterAll(async () => {
  if (conn) {
    await conn.close();
  }
});

describe('Test getArtworks queries', () => {
  let artwork1 = beforeAll(async () => {
    await conn.dropDatabase();
    await artworks.createArtwork(
      'First artwork',
      'This is my first artwork ever!',
      'drawing',
      Date.now(),
      '5125125',
      []
    );
    await artworks.createArtwork(
      'Second artwork',
      'My best artwork ever!',
      'graphic design',
      Date.now(),
      '2512515',
      []
    );
  });

  test('getArtworks by Category', async () => {
    let artwork = await artworks.getArtworksByCategory('drawing');
    expect(artwork).toBeTruthy();
    expect(artwork.length).toEqual(1);
    expect(artwork[0].title).toEqual('First artwork');

    artwork = await artworks.getArtworksByCategory('graphic');
    expect(artwork).toBeTruthy();
    expect(artwork.length).toEqual(1);
    expect(artwork[0].title).toEqual('Second artwork');
  });
});

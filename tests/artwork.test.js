const artworks = require('../data/artworks');
const users = require('../data/users');
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

test('Create new Artwork', async () => {
  let user1 = await users.createUser({
    firstName: 'Ayman',
    lastName: 'Elkfrawy',
    email: 'aelkfraw@stevens.edu',
    hashedPassword: 'strong_secret_password',
  });

  let artwork = await artworks.createArtwork(
    'My artwork',
    'This is my artwork description',
    'drawing',
    Date.now(),
    user1._id,
    []
  );
  let savedArtwork = await artworks.getArtworkById(artwork._id);
  expect(savedArtwork.title).toEqual(artwork.title);
  expect(savedArtwork.description).toEqual(artwork.description);
  expect(savedArtwork.category).toEqual(artwork.category);
  expect(savedArtwork.createDate).toEqual(artwork.createDate);
});

describe('Test getArtworks queries', () => {
  beforeAll(async () => {
    await conn.dropDatabase();
    let user1 = await users.createUser({
      firstName: 'Ayman',
      lastName: 'Elkfrawy',
      email: 'aelkfraw@stevens.edu',
      hashedPassword: 'strong_secret_password',
    });
    await artworks.createArtwork(
      'First artwork',
      'This is my first artwork ever!',
      'drawing',
      Date.now(),
      user1._id,
      []
    );
    await artworks.createArtwork(
      'Second artwork',
      'My best artwork ever!',
      'graphic design',
      Date.now(),
      user1._id,
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

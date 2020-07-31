const artworks = require('../data/artworks');
const users = require('../data/users');
const pictures = require('../data/pictures');

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

describe('Test get artwork pictures', () => {
  let user1, artwork1, artwork2, pic1, pic2, pic3;
  beforeAll(async () => {
    await conn.dropDatabase();
    user1 = await users.createUser({
      firstName: 'Ayman',
      lastName: 'Elkfrawy',
      email: 'aelkfraw@stevens.edu',
      hashedPassword: 'strong_secret_password',
    });

    artwork1 = await artworks.createArtwork('My artwork', 'This is my artwork', 'drawing', Date.now(), user1._id, []);
    artwork2 = await artworks.createArtwork('My artwork2', 'This is my artwork2', 'drawing', Date.now(), user1._id, []);

    pic1 = await pictures.createPicture(new Buffer('123456'), 'image/png', artwork1._id, 'Image 1');
    pic2 = await pictures.createPicture(new Buffer('123456'), 'image/png', artwork2._id, 'Image 2');
    pic3 = await pictures.createPicture(new Buffer('123456'), 'image/png', artwork2._id, 'Image 3');
  });

  test('Get picture by ID should return Data field', async () => {
    let pic11 = await pictures.getPictureById(pic1._id);
    expect(pic1.title).toBe(pic11.title);
    expect(pic11.data).toBeTruthy();
  });

  test('Get picture by ID should return pictureUrl', async () => {
    let pic11 = await pictures.getPictureById(pic1._id);
    expect(pic11.pictureUrl).toBe(`/pictures/content/${pic11._id}`);
    expect(pic11.toJSON().pictureUrl).toBe(`/pictures/content/${pic11._id}`);
  });

  test("Get Pictures by Artwork ID shouldn't return Data field", async () => {
    let pics = await pictures.getPicturesByArtworkId(artwork2._id);
    expect(pics.length).toBe(2);
    expect(pics[0].data).toBeFalsy();
    expect([pics[0].title, pics[1].title]).toEqual(expect.arrayContaining(['Image 2', 'Image 3']));
  });

  test('Get Pictures by Multiple ArtworkIDs', async () => {
    let pics = await pictures.getPicturesByArtworkIds([artwork1._id, artwork2._id]);
    expect(pics.length).toBe(3);
    expect(pics[0].data).toBeFalsy();
    expect([pics[0].title, pics[1].title, pics[2].title]).toEqual(
      expect.arrayContaining(['Image 2', 'Image 3', 'Image 1'])
    );
  });
});

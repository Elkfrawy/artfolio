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

describe('Test user queries', () => {
  let artwork1 = beforeAll(async () => {
    await conn.dropDatabase();

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
      hashedPassword: '111111',
      birthday: '01/01/1990',
      biography: 'Interested in color pencil',
    };

    await users.createUser(mirandaInfo);
  });

  test('getUser by email', async () => {
    let user = await users.getUserByEmail('xzou3@stevens.edu');
    expect(user).toBeTruthy();
  });
});

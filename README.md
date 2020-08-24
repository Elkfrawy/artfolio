# Artfolio

Artfolio is website for sharing your art portfolio with the world. This is a final project for Stevens Institute of Technology course CS-546 Summer 2020.

## Member
Ayman Elkfrawy, Xianqing Zou, Jack Yang

## Setting up and running the application
1. Under the project folder run `$ npm install` to install all required Node modules: 
2. Make sure that you have MongoDB installed on the same machine and running on port `27017`. If MongoDB is running on a different machine or different port, change the file `config/mongoConnection.js` accordingly. 
3. Seed the database using: `$ npm run seed`
4. Run the application using: `$ npm start`
5. Go to the url http://localhost:3000
6. The seed database will create three accounts: `aelkfraw@stevens.edu`, `xzou3@stevens.edu`, and `yyang105@stevens.edu`. These accounts have the same password: `artfolio123`.

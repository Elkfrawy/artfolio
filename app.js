const path = require('path');
const express = require('express');
const configRoutes = require('./routes');
const ehb = require('express-handlebars');
const Handlebars = require('handlebars');
const mongooseConnection = require('./config/mongoConnection');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const session = require('express-session');

const app = express();

app.use(
  session({
    name: 'AuthCookie',
    secret: 'smghsalk63@$%@69)*AGFSJAS*%AVAT535sf8749',
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  let authUser = req.session.user ? 'Authenticated User' : 'Non-Authenticated User';
  console.log(`[${new Date().toUTCString()}] ${req.method} ${req.originalUrl} (${authUser})`);
  next();
});

const dbConnection = mongooseConnection();
const static = express.static(path.join(__dirname, 'public'));

app.use(express.json());
app.use('/public', static);
app.use(express.urlencoded({ extended: true }));

app.engine('handlebars', ehb({ defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});

const path = require('path');
const express = require('express');
const session = require('express-session');
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

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

const handlebarsInst = ehb.create({
  defaultLayout: 'main',
  // Specify helpers which are only registered on this instance.
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === 'number') return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));

      return new Handlebars.SafeString(JSON.stringify(obj));
    },
  },
  partialsDir: ['views/partials/'],
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});

app.engine('handlebars', handlebarsInst.engine);
app.set('view engine', 'handlebars');

app.use(
  session({
    name: 'Artfolio',
    secret: 'Everyone is an artist',
    saveUninitialized: true,
    resave: false,
  })
);

configRoutes(app);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});

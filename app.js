const path = require('path');
const express = require('express');
const session = require('express-session');
const configRoutes = require('./routes');
const ehb = require('express-handlebars');
const Handlebars = require('handlebars');
const mongooseConnection = require('./config/mongoConnection');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const app = express();

app.use(
  session({
    name: 'AuthCookie',
    secret: 'Everyone is an artist. smghsalk63@$%@69)*AGFSJAS*%AVAT535sf8749',
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

app.use(async (req, res, next) => {
  if (req.body._method) {
    req.method = req.body._method;
  }
  next();
});

const forbiddenRoutes = (req, res, next) => {
  if (!req.session.user) {
    res.render('home/accessDenied');
  } else {
    next();
  }
};
app.use('/artworks/create', forbiddenRoutes);
app.use('/artworks/edit/:id', forbiddenRoutes);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use(async (req, res, next) => {
  if (req.body._method) {
    req.method = req.body._method;
  }
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
    divisibleBy: (num, divideBy) => {
      return num > 0 && num % divideBy == 0;
    },
    equals: (left, right) => {
      return left === right;
    },
  },
  partialsDir: ['views/partials/'],
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});

handlebarsInst.handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
handlebarsInst.handlebars.registerHelper('isMale', function (value) {
  return value == 'Male';
});

handlebarsInst.handlebars.registerHelper('isFemale', function (value) {
  return value == 'Female';
});

app.engine('handlebars', handlebarsInst.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});

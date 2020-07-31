const usersRoute = require('./users');
const homeRoute = require('./home');
const artworkRoute = require('./artworks');
const playground = require('./playground');
const pictureRoute = require('./pictures');

const routesSetup = (app) => {
  // Setup the routes here
  app.use('/', homeRoute);
  app.use('/users', usersRoute);
  app.use('/artworks', artworkRoute);
  app.use('/playground', playground);
  app.use('/pictures', pictureRoute);

  app.use('*', (req, res) => {
    res.sendStatus(404); // FIXME we need to redirect to error page
  });
};

module.exports = routesSetup;

const usersRoute = require('./users');
const homeRoute = require('./home');
const artworkRoute = require('./artworks');
const pictureRoute = require('./pictures');

const routesSetup = (app) => {
  // Setup the routes here
  app.use('/', homeRoute);
  app.use('/users', usersRoute);
  app.use('/artworks', artworkRoute);
  app.use('/pictures', pictureRoute);

  app.use('*', (req, res) => {
    res.status(404).render('home/404', { title: 'Page not found!' });
  });
};

module.exports = routesSetup;

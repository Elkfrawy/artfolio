const usersRoute = require('./users');
const homeRoute = require('./home');

const routesSetup = (app) => {
  // Setup the routes here
  app.use('/', homeRoute);
  app.use('/users', usersRoute);

  app.use('*', (req, res) => {
    res.sendStatus(404); // FIXME we need to redirect to error page
  });
};

module.exports = routesSetup;

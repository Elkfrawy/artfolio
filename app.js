const path = require('path');
const express = require('express');
const configRoutes = require('./routes');
const ehb = require('express-handlebars');
const Handlebars = require('handlebars');
const mongooseConnection = require('./config/mongoConnection');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const dbConnection = mongooseConnection();
const app = express();
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

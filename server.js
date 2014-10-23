var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var ejs = require('ejs');
var session = require('express-session');
var csrf = require('csurf');
var helmet = require('helmet');

var beerController = require('./controllers/beer');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');
var clientController = require('./controllers/client');
var oauth2Controller = require('./controllers/oauth2');

mongoose.connect('mongodb://localhost:27017/beerlocker');

var app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: 'Super Secret Session Key',
  cookie: {
    httpOnly: true,
    secure: true
  },
  saveUninitialized: true,
  resave: true
}));

app.use(csrf());

app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

app.use(helmet.csp({
  defaultSrc: ["'self'"],
  scriptSrc: [],
  styleSrc: [],
  imgSrc: [],
  connectSrc: [],
  fontSrc: [],
  objectSrc: [],
  mediaSrc: [],
  frameSrc: []
}));


//HELMET SECURITY SECTION
app.use(helmet.xssFilter());
app.use(helmet.xframe());
// Won't work until on SSL HTTPS
//app.use(helmet.hsts({
//  maxAge: 7776000000,
//  includeSubdomains: true
//}));
app.use(helmet.hidePoweredBy());
app.use(helmet.ienoopen());
app.use(helmet.nosniff());
app.use(helmet.nocache({
  noEtag: true
}));
app.use(helmet.crossdomain({
  caseSensitive: true
}));


app.use(passport.initialize());

var router = express.Router();

//START ROUTES

router.route('/beers')
  .post(authController.isAuthenticated, beerController.postBeers)
  .get(authController.isAuthenticated, beerController.getBeers);

router.route('/beers/:beer_id')
  .get(authController.isAuthenticated, beerController.getBeer)
  .put(authController.isAuthenticated, beerController.putBeer)
  .delete(authController.isAuthenticated, beerController.deleteBeer);

router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers);

router.route('/clients')
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients);

router.route('/oauth2/authorize')
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision);

router.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);

//END ROUTES

app.use('/api/v1', router);

app.listen(3000);
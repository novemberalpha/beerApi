var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Beer = require('./models/beer');

mongoose.connect('mongodb://localhost:27017/beerlocker');

var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

var port = process.env.PORT || 3000;

var router = express.Router();

router.get('/', function(req, res) {
  res.json({ message: 'You are running dangerously low on beer!' });
});

//POST BEER

var beersRoute = router.route('/beers');
beersRoute.post(function(req, res) {
  var beer = new Beer();
  beer.name = req.body.name;
  beer.type = req.body.type;
  beer.quantity = req.body.quantity;

  beer.save(function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'Beer added to the locker!', data: beer });
  });
});


//GET BEERS
beersRoute.get(function(req, res) {

  Beer.find(function(err, beers) {
    if (err)
        res.send(err);
      res.json(beers);
  });
});

//GET BEER
var beerRoute = router.route('/beers/:beer_id');

beerRoute.get(function(req, res) {
  Beer.findById(req.params.beer_id, function(err, beer) {
    if (err)
      res.send(err);
    res.json(beer);
  });
});

//PUT BEER
beerRoute.put(function(req, res) {
  Beer.findById(req.params.beer_id, function(err, beer) {
    if (err)
      res.send(err);
    beer.quantity = req.body.quantity;
    beer.save(function(err) {
      if (err)
        res.send(err);
      res.json(beer);
    });
  });
});

//DELETE BEER
beerRoute.delete(function(req, res) {
  Beer.findByIdAndRemove(req.params.beer_id, function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'Beer removed from Locker!' });
  });
});

//END ROUTES

app.use('/api', router);

app.listen(port);
console.log('Insert beer on port ' + port);



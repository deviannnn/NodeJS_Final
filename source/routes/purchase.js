var express = require('express');
var router = express.Router();

const title = 'Purchases';

router.get('/', function(req, res, next) {
  res.render('purchase', { title: title, subTitle: 'Purchase List'} );
});

router.get('/add', function(req, res, next) {
  res.render('purchase-add', { title: title, subTitle: 'New Purchase'});
});

module.exports = router;
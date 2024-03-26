var express = require('express');
var router = express.Router();

const title = 'Suppliers';

router.get('/', function(req, res, next) {
  res.render('supplier', { title: title, subTitle: 'Supplier List'} );
});

router.get('/add', function(req, res, next) {
  res.render('supplier-add', { title: title, subTitle: 'New Supplier'});
});

module.exports = router;
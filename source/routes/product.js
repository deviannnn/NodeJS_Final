var express = require('express');
var router = express.Router();

const controller = require('../controllers/product');
const { validate, checkProduct, checkUProduct } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.get('/', controller.renderList);

router.post('/getAll', controller.getAll);

router.post('/get', controller.getByID);

router.use(isAdmin);

router.get('/handle', controller.renderHandleView);

router.post('/create', [checkProduct, validate], controller.create);

router.put('/update', [checkUProduct, validate], controller.update);

router.delete('/remove', controller.remove);

module.exports = router;
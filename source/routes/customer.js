var express = require('express');
var router = express.Router();

const controller = require('../controllers/customer');
const { validate, checkCustomer, checkUCustomer } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.get('/', controller.renderList);

router.get('/register', controller.renderRegister);

router.post('/register', [checkCustomer, validate], controller.register);

router.post('/get', controller.getByID);

router.post('/getAll', controller.getAll);

router.put('/update', [checkUCustomer, validate], controller.update);

router.post('/search', controller.search);

router.use(isAdmin);

router.delete('/remove', controller.remove);

module.exports = router;
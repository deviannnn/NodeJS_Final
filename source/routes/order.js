var express = require('express');
var router = express.Router();

const controller = require('../controllers/order');
const { validate, checkOrder, checkTimeFrame } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.get('/invoice/:orderId', controller.renderInvoice);

router.post('/getByTimeFrame', [checkTimeFrame, validate], controller.getByTimeFrame);

router.post('/get', controller.get);

router.post('/create', [checkOrder, validate], controller.create);

router.use(isAdmin);

router.put('/update', controller.update);

router.delete('/remove', controller.remove);

module.exports = router;
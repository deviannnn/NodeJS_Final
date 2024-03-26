var express = require('express');
var router = express.Router();

const controller = require('../controllers/category');
const { validate, checkNameCategory, checkSpecsCategory, checkUCategory } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.get('/', controller.renderCategoryList);

router.post('/getAll', controller.getAll);

router.post('/get', controller.getByID);

router.post('/getSpec', controller.getSpec);

router.use(isAdmin);

router.get('/handle', controller.renderHandleView);

router.post('/create', [checkNameCategory, validate], controller.create);

router.put('/update', [checkUCategory, validate], controller.update);

router.post('/addSpecs', [checkSpecsCategory, validate], controller.addSpecs);

router.put('/updateSpecs', [checkSpecsCategory, validate], controller.updateSpecs);

router.delete('/removeSpecs', controller.removeSpecs);

router.delete('/remove', controller.remove);

module.exports = router;
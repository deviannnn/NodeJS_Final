var express = require('express');
var router = express.Router();

const controller = require('../controllers/variant');
const upload = require('../utils/upload-image');
const { validate, checkVariant, checkUVariant } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.post('/getAllByProduct', controller.getAllByProductID);

router.post('/getByBarcode', controller.getByBarcode);

router.post('/search', controller.search);

router.use(isAdmin);

const setRootFolder = (req, res, next) => {
    req.root = {};
    req.root.folder = 'product_variants';
    next();
}

router.post('/uploadImg', setRootFolder, upload.single('img'), controller.uploadImg);

router.post('/create', [checkVariant, validate], controller.create);

router.put('/update', [checkUVariant, validate], controller.update);

router.delete('/remove', controller.remove);

module.exports = router;
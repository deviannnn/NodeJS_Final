var express = require('express');
var router = express.Router();

const controller = require('../controllers/account');
const upload = require('../utils/upload-image');
const { validate, checkRegister, checkUAccount } = require('../middlewares/validate');
const { isAdmin } = require('../middlewares/auth');

router.get('/profile', controller.renderProfile);

router.post('/password/update', controller.passwordUpdate);

const setRootFolder = (req, res, next) => {
  req.root = {};
  req.root.folder = 'accounts';
  next();
}

router.post('/uploadAvt', setRootFolder, upload.single('avatar'), controller.uploadAvt);

router.use(isAdmin);

router.get('/', controller.renderList);

router.get('/register', controller.renderRegister);

router.post('/register', [checkRegister, validate], controller.register);

router.post('/resendMail', controller.resendMail);

router.post('/get', controller.getByID);

router.post('/getAll', controller.getAll);

router.put('/update', [checkUAccount, validate], controller.update);

router.delete('/remove', controller.remove);

module.exports = router;
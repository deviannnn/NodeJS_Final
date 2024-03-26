var express = require('express');
var router = express.Router();
const { loginLimiter, passwordResetLimiter } = require('../configs/ratelimit')

const accountController = require('../controllers/account');
const auth = require('../middlewares/auth');
const { renderAvatar } = require('../middlewares/render');

router.get('/login', accountController.renderLogin);

router.post('/login', loginLimiter, accountController.login);

router.get('/password/reset', accountController.renderPasswordReset);

router.post('/password/reset', passwordResetLimiter, accountController.passwordReset);

router.use(auth.authenticate);

router.get('/password/change', auth.isPasswordChange, accountController.renderPasswordChange);

router.post('/password/change', auth.isPasswordChange, accountController.passwordChange);

router.use(auth.checkRevokedToken, auth.isLoggedIn);

router.post('/logout', accountController.logout);

router.use(renderAvatar);

router.get('/', (req, res) => { res.render('index', { title: 'Dashboard', script: 'dashboard' }) })

router.get('/pos', (req, res) => { res.render('pos', { layout: null }) })

const customerRouter = require('./customer');
const accountRouter = require('./account');
const categoryRouter = require('./category');
const productRouter = require('./product');
const variantRouter = require('./variant');
const orderRouter = require('./order');

const purchaseRouter = require('./purchase');
const supplierRouter = require('./supplier');

router.use('/account', accountRouter);
router.use('/customer', customerRouter);
router.use('/category', categoryRouter);
router.use('/product', productRouter);
router.use('/variant', variantRouter);
router.use('/order', orderRouter);

router.use('/purchase', purchaseRouter);
router.use('/supplier', supplierRouter);

module.exports = router;
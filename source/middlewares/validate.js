const { validationResult, check } = require('express-validator');
const Account = require('../models/account');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Variant = require('../models/variant');

const isGmail = (value) => {
    return /^\w+([\.-]?\w+)*@gmail\.com$/.test(value);
};

const checkRegister = [
    check('gmail')
        .custom((value) => {
            if (!isGmail(value)) {
                throw new Error('Invalid gmail format. Please provide a Gmail address.');
            }
            return true;
        })
        .custom(async (value) => {
            const existingAccount = await Account.findOne({ gmail: value });
            if (existingAccount) {
                throw new Error('Email already exists.');
            }
        }),

    check('name')
        .not().isEmpty().withMessage('Fullname cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Fullname should only contain letters and spaces.'),

    check('gender')
        .not().isEmpty().withMessage('Gender cannot be empty.')
        .isIn(['male', 'female']).withMessage('Invalid gender value.'),

    check('birthday')
        .not().isEmpty().withMessage('Birthday cannot be empty.')
        .custom((value) => {
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                throw new Error('Invalid date format.');
            }
            return true;
        }),

    check('phone')
        .not().isEmpty().withMessage('Phone cannot be empty.')
        .isNumeric().withMessage('Phone must contain only numbers.')
        .isLength({ min: 10, max: 11 }).withMessage('Phone must be 10 or 11 digits long.')
        .custom(async (value) => {
            const existingAccount = await Account.findOne({ 'profile.phone': value });
            if (existingAccount) {
                throw new Error('Phone number already exists.');
            }
        }),

    check('num')
        .not().isEmpty().withMessage('Address number cannot be empty.')
        .isString().withMessage('Invalid address number value.'),

    check('street')
        .not().isEmpty().withMessage('Street cannot be empty.')
        .isString().withMessage('Invalid street value'),

    check('ward')
        .not().isEmpty().withMessage('Ward cannot be empty.')
        .isString().withMessage('Invalid ward value.'),

    check('district')
        .not().isEmpty().withMessage('District cannot be empty.')
        .isString().withMessage('Invalid district value.'),

    check('city')
        .not().isEmpty().withMessage('City cannot be empty.')
        .isString().withMessage('Invalid city value.'),
];

const checkUAccount = [
    check('Id')
        .not().isEmpty().withMessage('Account ID cannot be empty.')
        .custom(async (value, { req }) => {
            if (value) {
                const existingAccount = await Account.findOne({ Id: value });
                if (!existingAccount) {
                    throw new Error(`Account not found with ID is ${value}.`);
                }
            }
            return true
        }),

    check('gmail')
        .optional()
        .custom((value) => {
            if (!isGmail(value)) {
                throw new Error('Invalid gmail format. Please provide a Gmail address.');
            }
            return true;
        })
        .custom(async (value, { req }) => {
            if (value) {
                const existingAccount = await Account.findOne({ gmail: value, Id: { $ne: req.body.Id } });
                if (existingAccount) {
                    throw new Error('Email already exists.');
                }
            }
        }),

    check('name')
        .optional()
        .not().isEmpty().withMessage('Fullname cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Fullname should only contain letters and spaces.'),

    check('gender')
        .optional()
        .not().isEmpty().withMessage('Gender cannot be empty.')
        .isIn(['male', 'female']).withMessage('Invalid gender value.'),

    check('birthday')
        .optional()
        .not().isEmpty().withMessage('Birthday cannot be empty.')
        .custom((value) => {
            if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                throw new Error('Invalid date format.');
            }
            return true;
        }),

    check('phone')
        .optional()
        .not().isEmpty().withMessage('Phone cannot be empty.')
        .isNumeric().withMessage('Phone must contain only numbers.')
        .isLength({ min: 10, max: 11 }).withMessage('Phone must be 10 or 11 digits long.')
        .custom(async (value, { req }) => {
            if (value) {
                const existingAccount = await Account.findOne({ 'profile.phone': value, Id: { $ne: req.body.Id } });
                if (existingAccount) {
                    throw new Error('Phone number already exists.');
                }
            }
        }),

    check('num')
        .optional()
        .not().isEmpty().withMessage('Address number cannot be empty.')
        .isString().withMessage('Invalid address number value.'),

    check('street')
        .optional()
        .not().isEmpty().withMessage('Street cannot be empty.')
        .isString().withMessage('Invalid street value'),

    check('ward')
        .optional()
        .not().isEmpty().withMessage('Ward cannot be empty.')
        .isString().withMessage('Invalid ward value.'),

    check('district')
        .optional()
        .not().isEmpty().withMessage('District cannot be empty.')
        .isString().withMessage('Invalid district value.'),

    check('city')
        .optional()
        .not().isEmpty().withMessage('City cannot be empty.')
        .isString().withMessage('Invalid city value.'),

    check('role')
        .optional()
        .isIn(['admin', 'staff']).withMessage('Invalid role value. Role should be \'admin\' or \'staff\''),

    check('locked')
        .optional()
        .isBoolean().withMessage('Invalid locked value.')
];

const checkNameCategory = [
    check('name')
        .not().isEmpty().withMessage('Category\'s name cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Category\'s name should only contain letters and spaces.')
];

const checkUCategory = [
    check('name')
        .optional()
        .not().isEmpty().withMessage('Category\'s name cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Category\'s name should only contain letters and spaces.'),

    check('actived')
        .optional()
        .isBoolean().withMessage('Invalid actived value.')
];

const checkSpecsCategory = [
    check('categoryId')
        .not().isEmpty().withMessage('Category cannot be empty.')
        .isMongoId().withMessage('Invalid category ID.'),

    check('name')
        .not().isEmpty().withMessage('Specification\'s name cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Specification\'s name should only contain letters and spaces.'),

    check('options')
        .isArray().withMessage('Invalid options.')
        .custom((options, { req }) => {
            if (options) {
                if (options.length === 0) {
                    throw new Error('Options should not be empty.');
                }

                options.forEach((option, index) => {
                    if (!option || typeof option !== 'string' || option.trim() === '') {
                        throw new Error(`Invalid option at index ${index}. Options should be strings.`);
                    }
                });

                return true;
            } else {
                throw new Error('Options should not be empty.');
            }
        })
];

const checkProduct = [
    check('categoryId')
        .not().isEmpty().withMessage('Category cannot be empty.')
        .isMongoId().withMessage('Invalid category ID.'),

    check('name')
        .not().isEmpty().withMessage('Product\'s name cannot be empty.')
        .isString().withMessage('Product\'s color must be a string.'),
];

const checkUProduct = [
    check('productId')
        .optional()
        .not().isEmpty().withMessage('Product ID cannot be empty.')
        .isMongoId().withMessage('Invalid product ID.'),

    check('categoryId')
        .optional()
        .not().isEmpty().withMessage('Category ID cannot be empty.')
        .isMongoId().withMessage('Invalid category ID.'),

    check('name')
        .optional()
        .not().isEmpty().withMessage('Product\'s name cannot be empty.')
        .isString().withMessage('Product\'s color must be a string.'),

    check('specs')
        .optional()
        .isArray().withMessage('Invalid specifications.'),

    check('actived')
        .optional()
        .isBoolean().withMessage('Invalid actived value.')
];

const checkVariant = [
    check('productId')
        .not().isEmpty().withMessage('Product cannot be empty.')
        .isMongoId().withMessage('Invalid product ID.')
        .custom(async (value, { req }) => {
            if (value) {
                const existingProduct = await Product.findOne({ _id: value });
                if (!existingProduct) {
                    throw new Error('Product not found.');
                }
            }
            return true
        }),

    check('barcode')
        .not().isEmpty().withMessage('Barcode cannot be empty.')
        .isString().withMessage('Barcode must be a string.')
        .custom(async (value) => {
            if (value) {
                const existingVariant = await Variant.findOne({ barcode: value });
                if (existingVariant) {
                    throw new Error('Barcode already exists.');
                }
            }
        }),

    check('color')
        .not().isEmpty().withMessage('Product Variant\'s color cannot be empty.')
        .isString().withMessage('Product Variant\'s color must be a string.'),

    check('cost')
        .not().isEmpty().withMessage('Cost cannot be empty.')
        .isNumeric().withMessage('Cost must be a number.'),

    check('price')
        .not().isEmpty().withMessage('Price cannot be empty.')
        .isNumeric().withMessage('Price must be a number.'),

    check('quantity')
        .optional()
        .not().isEmpty().withMessage('Quantity cannot be empty.')
        .isNumeric().withMessage('Quantity must be a number.'),

    check('warn')
        .not().isEmpty().withMessage('Warn cannot be empty.')
        .isNumeric().withMessage('Warn must be a number.')
];

const checkUVariant = [
    check('selectedBarcode')
        .not().isEmpty().withMessage('No variation is selected. Please try again.')
        .custom(async (value, { req }) => {
            if (value) {
                const existingVariant = await Variant.findOne({ barcode: value });
                if (!existingVariant) {
                    throw new Error(`Variant not found with selected barcode is ${value}.`);
                }
            }
            return true
        }),

    check('barcode')
        .optional()
        .not().isEmpty().withMessage('New barcode cannot be empty.')
        .custom(async (value, { req }) => {
            if (value === req.body.selectedBarcode) return true;
            if (value) {
                const existingVariant = await Variant.findOne({ barcode: value });
                if (existingVariant) {
                    throw new Error('Barcode already exists.');
                }
            }
            return true
        }),

    check('color')
        .optional()
        .not().isEmpty().withMessage('Product Variant\'s color cannot be empty.'),

    check('cost')
        .optional()
        .not().isEmpty().withMessage('Cost cannot be empty.')
        .isNumeric().withMessage('Cost must be a number.'),

    check('price')
        .optional()
        .not().isEmpty().withMessage('Price cannot be empty.')
        .isNumeric().withMessage('Price must be a number.'),

    check('quantity')
        .optional()
        .not().isEmpty().withMessage('Quantity cannot be empty.')
        .isNumeric().withMessage('Quantity must be a number.'),

    check('warn')
        .optional()
        .not().isEmpty().withMessage('Warn cannot be empty.')
        .isNumeric().withMessage('Warn must be a number.'),

    check('actived')
        .optional()
        .isBoolean().withMessage('Invalid actived value.')
];

const checkCustomer = [
    check('name')
        .not().isEmpty().withMessage('Fullname cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Fullname should only contain letters and spaces.'),

    check('phone')
        .not().isEmpty().withMessage('Phone cannot be empty.')
        .isNumeric().withMessage('Phone must contain only numbers.')
        .isLength({ min: 10, max: 11 }).withMessage('Phone must be 10 or 11 digits long.')
        .custom(async (value) => {
            const existingCustomer = await Customer.findOne({ phone: value });
            if (existingCustomer) {
                throw new Error('Phone number already exists.');
            }
        })
];

const checkUCustomer = [
    check('name')
        .optional()
        .not().isEmpty().withMessage('Fullname cannot be empty.')
        .matches(/^[\p{L}\s]*$/u).withMessage('Fullname should only contain letters and spaces.'),

    check('phone')
        .optional()
        .not().isEmpty().withMessage('Phone cannot be empty.')
        .isNumeric().withMessage('Phone must contain only numbers.')
        .isLength({ min: 10, max: 11 }).withMessage('Phone must be 10 or 11 digits long.')
        .custom(async (value, { req }) => {
            if (value) {
                const existingCustomer = await Customer.findOne({ phone: value, Id: { $ne: req.body.Id } });
                if (existingCustomer) {
                    throw new Error('Phone number already exists.');
                }
            }
        })
];

const checkOrder = [
    check('customer')
        .optional()
        .not().isEmpty().withMessage('Customer cannot be empty.')
        .custom(async (value) => {
            const customer = await Customer.findOne({ Id: value });
            if (!customer) {
                throw new Error('Customer does not exist.');
            }
        }),

    check('summaryAmount.subTotal')
        .notEmpty().withMessage('Subtotal is required')
        .isInt({ gt: 0 }).withMessage('Subtotal must be greater than 0.'),

    check('summaryAmount.discount')
        .optional()
        .isInt({ min: 0 }).withMessage('Discount must be greater than 0.'),

    check('summaryAmount.voucher')
        .optional()
        .isInt({ min: 0 }).withMessage('Voucher must be greater than 0.'),

    check('summaryAmount.totalAmount')
        .notEmpty().withMessage('Total amount is required')
        .isInt({ gt: 0 }).withMessage('Total amount must be greater than 0.'),

    check('items.*.variant')
        .notEmpty().withMessage('Item is required')
        .custom(async (value) => {
            const item = await Variant.findOne({ _id: value, actived: true });
            if (!item) {
                throw new Error(`Item does not exist or is not active.`);
            }
        }),

    check('items.*.quantity')
        .notEmpty().withMessage('Item quantity is required')
        .isInt({ gt: 0 }).withMessage('Item quantity must be greater than 0.'),

    check('items.*.price')
        .notEmpty().withMessage('Item price is required')
        .isInt({ gt: 0 }).withMessage('Item price must be greater than 0.'),

    check('items.*.amount')
        .notEmpty().withMessage('Item amount is required')
        .isInt({ gt: 0 }).withMessage('Item amount must be greater than 0.'),

    check('payment.receive')
        .notEmpty().withMessage('Receive is required')
        .isInt({ gt: 0 }).withMessage('Receive must be greater than 0.'),

    check('payment.change')
        .notEmpty().withMessage('Change is required')
        .isInt({ min: 0 }).withMessage('Change must be an integer'),

    check('payment.remainAmount')
        .notEmpty().withMessage('Remain amount is required')
        .isInt({ min: 0 }).withMessage('Remain amount must be greater than 0.'),

    check('payment.method').notEmpty().isIn(['cash', 'banking']).withMessage('Payment method must be cash or banking'),
    check('payment.type').notEmpty().isIn(['full payment', 'installment']).withMessage('Payment type must be full payment or installment'),
]

const checkTimeFrame = [
    check('timeframe')
        .isIn(['today', 'yesterday', 'last7days', 'thisweek', 'previousweek', 'thismonth', 'previousmonth', 'custom']).withMessage('Invalid time frame.'),
    check('startDate').optional().isISO8601({ strict: true, strictDate: true }).withMessage('Invalid start date.'),
    check('endDate').optional().isISO8601({ strict: true, strictDate: true }).withMessage('Invalid end date.')
]

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({ field: error.path, msg: error.msg }));
        return res.status(400).json({ success: false, type: 0, errors: errorMessages });
    }
    next();
}

module.exports = {
    validate, checkRegister, checkUAccount, checkNameCategory, checkSpecsCategory, checkUCategory,
    checkProduct, checkUProduct, checkVariant, checkUVariant, checkCustomer, checkUCustomer, checkOrder,
    checkTimeFrame
};
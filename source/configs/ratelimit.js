const createError = require('http-errors');
const rateLimit = require('express-rate-limit');

const commonLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10000,
    handler: (req, res, next) => {
        return next(createError(429));
    }
});

const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    handler: (req, res, next) => {
        return next(createError(429));
    }
});

const passwordResetLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    handler: (req, res, next) => {
        return next(createError(429));
    }
});

module.exports = { commonLimiter, loginLimiter, passwordResetLimiter };
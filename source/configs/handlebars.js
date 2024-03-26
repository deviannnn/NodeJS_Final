const hbs = require('express-handlebars');

const hbsEngine = hbs.engine({
    defaultLayout: 'layout',
    helpers: {
        add: function (a, b) {
            return a + b;
        },
        isEqual: function (a, b, options) {
            return a === b ? options.fn(this) : options.inverse(this);
        },
        eq: function (a, b) {
            return a === b;
        },
    }
})

module.exports = { hbsEngine }
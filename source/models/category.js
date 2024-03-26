const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    specs: [{
        name: { type: String, required: true },
        options: [{ type: String, required: true }]
    }],
    actived: { type: Boolean, required: true, default: true },
    created: {
        Id: { type: String, required: true },
        name: { type: String, required: true },
        datetime: { type: Date, required: true, default: Date.now },
    },
    updated: [{
        Id: { type: String, required: true },
        name: { type: String, required: true },
        datetime: { type: Date, required: true, default: Date.now },
    }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
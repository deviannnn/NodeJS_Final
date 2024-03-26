const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    Id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    points: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    timeline: [{
        points: { type: Number, required: true },
        datetime: { type: Date, default: Date.now }
    }],
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

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
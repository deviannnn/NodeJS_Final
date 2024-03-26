const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    gmail: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    bankName: { type: String, required: true },
    bankNum: { type: String, required: true },
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

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
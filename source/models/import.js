const mongoose = require('mongoose');

const importSchema = new mongoose.Schema({
    totalAmount: { type: Number, required: true },
    receive: { type: Boolean, required: true, default: false },
    note: { type: String },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
        quantity: { type: Number, required: true },
        cost: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    created: {
        datetime: { type: Date, default: Date.now },
        createdBy: { type: String, required: true }
    },
    updated: [{
        datetime: { type: Date, default: Date.now },
        updatedBy: { type: String, required: true }
    }]
});

const Import = mongoose.model('Import', importSchema);

module.exports = Import;
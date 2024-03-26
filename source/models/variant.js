const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    img: { type: String, required: true },
    barcode: { type: String, unique: true, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    warn: { type: Number, required: false },
    timeline: [{
        quantity: { type: Number, required: true },
        action: { type: String, enum: ['sell', 'import', 'editing'], required: true },
        datetime: { type: Date, default: Date.now }
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

variantSchema.methods.getStatus = function () {
    if (this.timeline.length === 0) {
        return 'new';
    } else {
        if (this.quantity <= 0) {
            return 'out of stock';
        } else if (this.quantity < this.warn) {
            return 'warning';
        } else {
            return 'in stock';
        }
    }
};

const Variant = mongoose.model('Variant', variantSchema);

module.exports = Variant;
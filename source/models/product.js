const mongoose = require('mongoose');
const Variant = require('./variant');

const productSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    specs: [{
        name: { type: String, required: false },
        option: { type: String, required: false }
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

productSchema.methods.getVariants = async function () {
    const productId = this._id;
    let variants = await Variant.find({ product: productId });

    if (variants.length > 0) {
        variants = variants.map(variant => {
            return { ...variant.toObject(), status: variant.getStatus() };
        });
    }

    return variants;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
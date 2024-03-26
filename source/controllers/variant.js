const mongoose = require('mongoose');
const Variant = require('../models/variant');
const Product = require('../models/product');
const Order = require('../models/order');

const create = async (req, res) => {
    const { productId, barcode, color, quantity, warn, cost, price } = req.body;

    try {
        const newVariant = new Variant({
            product: new mongoose.Types.ObjectId(productId),
            img: 'default.png',
            barcode: barcode,
            color: color,
            cost: cost,
            price: price,
            quantity: quantity !== undefined ? quantity : 0,
            warn: warn,
            created: {
                Id: req.user.Id,
                name: req.user.name
            }
        });

        await newVariant.save();

        return res.status(201).json({ success: true, title: 'Created!', message: 'Variant created successfully.', variant: newVariant });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getAllByProductID = async (req, res) => {
    const { productId } = req.body;

    try {
        let variants = await Variant.find({ product: productId });
        if (variants.length === 0) {
            return res.status(400).json({ success: false, message: 'Variants not found with this Product ID' });
        }

        variants = variants.map((variant) => ({
            product: variant.product,
            barcode: variant.barcode,
            img: variant.img,
            color: variant.color,
            quantity: variant.quantity,
            cost: variant.cost,
            price: variant.price,
            warn: variant.warn,
            status: variant.getStatus(),
            timeline: variant.timeline,
            actived: variant.actived,
            created: variant.created,
            updated: variant.updated
        }))

        return res.status(200).json({ success: true, variants: variants });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getByBarcode = async (req, res) => {
    const { barcode } = req.body;

    try {
        let variant = await Variant.findOne({ barcode });
        if (!variant) {
            return res.status(400).json({ success: false, message: 'Variant not found.' });
        }

        variant = { ...variant.toObject(), status: variant.getStatus() };

        return res.status(200).json({ success: true, variant: variant });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const update = async (req, res) => {
    const { selectedBarcode, barcode, quantity, color, warn, cost, price, actived } = req.body;

    try {
        const updatedVariant = await Variant.findOne({ barcode: selectedBarcode });

        const updateFields = { color, warn, cost, price, actived };

        let diff = false;

        for (const [key, value] of Object.entries(updateFields)) {
            if (value !== undefined && value.toString() !== updatedVariant[key].toString()) {
                updatedVariant[key] = value;
                diff = true;
            }
        }
        if (barcode !== undefined && barcode !== updatedVariant.barcode) {
            updatedVariant.barcode = barcode;
            diff = true;
        }
        if (quantity !== undefined && quantity.toString() !== updatedVariant.quantity.toString()) {
            updatedVariant.timeline.push({
                quantity: quantity - updatedVariant.quantity,
                action: 'editing',
                datetime: Date.now()
            })
            updatedVariant.quantity = quantity;
            diff = true;
        }

        if (!diff) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        updatedVariant.updated.push({
            Id: req.user.Id,
            name: req.user.name,
            datetime: Date.now()
        });

        await updatedVariant.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Variant updated successfully.', variant: updatedVariant });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const remove = async (req, res) => {
    const { barcode } = req.body;

    try {
        const deletedVariant = await Variant.findOne({ barcode });
        if (!deletedVariant) {
            return res.status(404).json({ success: false, message: 'Variant not found.' });
        }

        const orderWithVariant = await Order.exists({ 'items.variant': deletedVariant._id });
        if (orderWithVariant) {
            return res.status(400).json({ success: false, message: 'Cannot delete. There are orders associated with it.' });
        }

        await Variant.deleteOne({ barcode });

        return res.status(200).json({ success: true, title: 'Deleted!', message: 'Variant deleted successfully.', variant: deletedVariant });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const uploadImg = async (req, res) => {
    const { barcode } = req.body;
    try {
        const uploadVariant = await Variant.findOne({ barcode });
        if (!uploadVariant) {
            return res.status(404).json({ success: false, message: 'Variant not found.' });
        }

        if (req.file !== undefined) {
            uploadVariant.img = req.file.filename;
            await uploadVariant.save();

            return res.status(200).json({ success: true });
        } else {
            return res.status(400).json({ success: false });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const search = async (req, res) => {
    const searchTerm = req.body.searchTerm;

    try {
        const productIds = await Product.find({
            name: { $regex: searchTerm, $options: 'i' }
        }).distinct('_id');

        const results = await Variant.find({
            actived: true,
            $or: [
                { 'product': { $in: productIds } },
                { color: { $regex: searchTerm, $options: 'i' } },
                { barcode: { $regex: searchTerm, $options: 'i' } }
            ]
        })
            .populate({
                path: 'product',
                select: 'name'
            })
            .exec();

        const formattedResults = results.map(result => ({
            _id: result._id.toString(),
            productName: result.product.name,
            productId: result.product._id.toString(),
            color: result.color,
            barcode: result.barcode,
            price: result.price,
            img: result.img,
        }));

        return res.json(formattedResults);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getAllByProductID, getByBarcode, create, update, remove, uploadImg, search };
const mongoose = require('mongoose');
const Product = require('../models/product');
const Variant = require('../models/variant');
const Order = require('../models/order');
const Category = require('../models/category');

const { formatDate } = require('../utils/format');

const create = async (req, res) => {
    const { categoryId, name, specs } = req.body;

    try {
        const existingCategory = await Category.findOne({ _id: categoryId });
        if (!existingCategory) {
            return res.status(400).json({ success: false, message: 'Category not found.' });
        }

        const newProduct = new Product({
            category: new mongoose.Types.ObjectId(categoryId),
            name: name,
            specs: specs,
            created: {
                Id: req.user.Id,
                name: req.user.name
            }
        });

        await newProduct.save();

        return res.status(201).json({ success: true, title: 'Created!', message: 'Product created successfully.', product: newProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getAll = async (req, res) => {
    try {
        const products = await Product.find();

        res.status(200).json({ success: true, products: products });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getByID = async (req, res) => {
    const { productId } = req.body;

    try {
        let product = await Product.findOne({ _id: productId });
        if (!product) {
            return res.status(400).json({ success: false, message: 'Product not found.' });
        }

        await product.populate('category');

        let variants = await product.getVariants();
        if (variants.length > 0 && req.user.role !== 'admin') {
            variants = variants.map(variant => {
                const { cost, ...variantWithoutCost } = variant;
                return variantWithoutCost;
            });
        }

        product = { ...product._doc, variants };

        return res.status(200).json({ success: true, product: product });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const update = async (req, res) => {
    let { productId, categoryId, name, specs, actived } = req.body;

    try {
        const updatedProduct = await Product.findOne({ _id: productId });
        if (!updatedProduct) {
            return res.status(400).json({ success: false, message: 'Product not found.' });
        }

        const removeIdsFromSpecs = (specs) => {
            return specs.map(spec => {
                const { _id, name, option } = spec;
                return { name, option };
            });
        };

        let diff = false;
        if (categoryId !== undefined && categoryId !== updatedProduct.category.toString()) {
            const existingCategory = await Category.findOne({ _id: categoryId });
            if (!existingCategory) {
                return res.status(400).json({ success: false, message: 'Category not found.' });
            }

            updatedProduct.category = new mongoose.Types.ObjectId(categoryId);
            diff = true;
        }
        if (name !== undefined && name !== updatedProduct.name) {
            updatedProduct.name = name;
            diff = true;
        }
        if (specs !== undefined && JSON.stringify(specs) !== JSON.stringify(removeIdsFromSpecs(updatedProduct.specs))) {
            updatedProduct.specs = specs;
            diff = true;
        }
        if (actived !== undefined && actived !== updatedProduct.actived) {
            updatedProduct.actived = actived;
            diff = true;
        }

        if (!diff) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        updatedProduct.updated.push({
            Id: req.user.Id,
            name: req.user.name,
            datetime: Date.now(),
        });

        await updatedProduct.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Product updated successfully.', product: updatedProduct });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const remove = async (req, res) => {
    const { productId } = req.body;

    try {
        const variants = await Variant.find({ product: productId });
        const orderWithProduct = await Order.exists({ 'items.variant': { $in: variants.map(variant => variant._id) } });
        if (orderWithProduct) {
            return res.status(400).json({ success: false, message: 'Cannot delete. There are orders associated with it.' });
        }

        const deletedProduct = await Product.findOneAndDelete({ _id: productId });
        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        return res.status(200).json({ success: true, title: 'Deleted!', message: 'Product deleted successfully.', product: deletedProduct });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const renderList = async (req, res, next) => {
    try {
        let products = await Product.find();

        if (products.length !== 0) {
            products = await Promise.all(products.map(async (product) => {
                await product.populate('category');
                return {
                    id: product._id.toString().trim(),
                    img: 'default.png',
                    name: product.name,
                    category: product.category.name,
                    status: product.actived,
                    specs: product.specs.length > 0 ? product.specs.map((spec) => ({ name: spec.name, option: spec.option })) : null,
                    updated: product.updated.length > 0 ? formatDate(product.updated[product.updated.length - 1].datetime) : formatDate(product.created.datetime)
                };
            }));
        }

        res.render('product_list', { title: "Products", subTitle: 'Product List', products: products, script: 'product_list' });
    } catch (error) {
        return next(error);
    }
}

const renderHandleView = async (req, res, next) => {
    const sourceAction = req.query.source;
    if (sourceAction === 'edit') {
        try {
            const editProduct = await Product.findOne({ _id: req.query.id });
            if (!editProduct) {
                return next();
            }

            res.render('product_handle', { title: 'Products', subTitle: 'Edit Product', source: sourceAction, script: 'product_handle_edit' });

        } catch (error) {
            return next();
        }
    } else {
        res.render('product_handle', { title: 'Products', subTitle: 'New Product', source: sourceAction, script: 'product_handle_add' });
    }
}

module.exports = { renderList, renderHandleView, getAll, getByID, create, update, remove };
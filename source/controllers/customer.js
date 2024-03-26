const Customer = require('../models/customer');
const Account = require('../models/account');
const Order = require('../models/order');
const bcrypt = require('bcrypt');

const { formatDate, formatDateTime } = require('../utils/format');
const { generateId } = require('../utils/auto-id');

const register = async (req, res) => {
    const { name, phone } = req.body;

    try {
        const newCustomer = new Customer({
            Id: generateId('STC'),
            name: name,
            phone: phone,
            created: {
                Id: req.user.Id,
                name: req.user.name
            }
        });

        await newCustomer.save();

        return res.status(201).json({ success: true, title: 'Registed!', message: 'Customer registered successfully.', customer: newCustomer });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getAll = async (req, res) => {
    try {
        const customers = await Customer.find();

        res.status(200).json({ success: true, customers: customers });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getByID = async (req, res) => {
    const { Id } = req.body;

    try {
        const customer = await Customer.findOne({ Id });
        if (!customer) {
            return res.status(400).json({ success: false, message: 'Customer not found.' });
        }

        let orders = await Order.find({ customer: customer._id })
            .populate({
                path: 'cashier',
                select: 'profile.name'
            })
            .populate({
                path: 'items.variant',
                populate: {
                    path: 'product',
                    select: 'name'
                }
            })
            .sort({ created: -1 })
            .exec();

        if (orders.length > 0) {
            orders = orders.map(order => ({
                Id: order.Id,
                customer: order.customer.name,
                cashier: order.cashier.profile.name,
                date: formatDateTime(order.created),
                summaryAmount: order.summaryAmount,
                payment: order.payment,
                items: order.items.map(item => ({
                    name: item.variant.product.name,
                    color: item.variant.color,
                    barcode: item.variant.barcode,
                    quantity: item.quantity,
                    price: item.price,
                    amount: item.amount
                }))
            }))
        }

        return res.status(200).json({ success: true, customer: customer, orders: orders });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const update = async (req, res) => {
    const { Id, name, phone, password } = req.body;

    try {
        const adminAuth = await Account.findOne({ role: 'admin' });
        if (password === undefined || !adminAuth || !bcrypt.compareSync(password, adminAuth.password)) {
            return res.status(400).json({ success: false, message: 'Incorrect authentication.' });
        }

        const updatedCustomer = await Customer.findOne({ Id });
        if (!updatedCustomer) {
            return res.status(400).json({ success: false, message: 'Customer not found.' });
        }

        let diff = false;
        if (name !== undefined && name !== updatedCustomer.name) {
            updatedCustomer.name = name;
            diff = true;
        }
        if (phone !== undefined && phone !== updatedCustomer.phone) {
            updatedCustomer.phone = phone;
            diff = true;
        }
        if (!diff) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        updatedCustomer.updated.push({
            Id: req.user.Id,
            name: req.user.name,
            datetime: Date.now(),
        });

        await updatedCustomer.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Customer updated successfully.', customer: updatedCustomer });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const remove = async (req, res) => {
    const { Id } = req.body;

    try {
        const deletedCustomer = await Customer.findOne({ Id });
        if (!deletedCustomer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }

        const orderWithCustomer = await Order.exists({ customer: deletedCustomer._id });
        if (orderWithCustomer) {
            return res.status(400).json({ success: false, message: 'Cannot delete. There are orders associated with it.' });
        }

        await Customer.deleteOne({ Id });

        return res.status(200).json({ success: true, title: 'Deleted!', message: 'Customer deleted successfully.', customer: deletedCustomer });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const renderList = async (req, res, next) => {
    try {
        let customers = await Customer.find({ Id: { $ne: "WG" } });

        if (customers.length !== 0) {
            customers = customers.map(customer => ({
                Id: customer.Id,
                name: customer.name,
                phone: customer.phone,
                points: customer.points,
                updated: customer.updated.length > 0 ? formatDate(customer.updated[customer.updated.length - 1].datetime) : formatDate(customer.created.datetime)
            }))
        }

        res.render('customer_list', { title: 'Customers', subTitle: 'Customer List', customers: customers, script: 'customer_list' });
    } catch (error) {
        return next(error);
    }
}

const search = async (req, res) => {
    const searchTerm = req.body.searchTerm;

    try {
        const results = await Customer.find({
            $or: [
                { Id: { $regex: searchTerm, $options: 'i', $nin: ["WG"] } },
                { phone: { $regex: searchTerm, $options: 'i', $nin: ["Walk-in Guest"] } }
            ]
        });

        const formattedResults = results.map(result => ({
            Id: result.Id,
            name: result.name,
            phone: result.phone,
            discount: result.discount
        }));

        return res.json(formattedResults);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const renderRegister = (req, res) => {
    res.render('customer_register', { title: 'Customers', subTitle: 'New Customer', script: 'customer_register' });
}

module.exports = { register, getAll, getByID, update, remove, renderList, search, renderRegister };
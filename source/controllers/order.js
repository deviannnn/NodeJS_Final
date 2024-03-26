const createError = require('http-errors');
const mongoose = require('mongoose');
const Order = require('../models/order');
const Customer = require('../models/customer');

const { generateOrderNumber } = require('../utils/auto-id');
const { formatDateTime, formatCurrency } = require('../utils/format');

const create = async (req, res) => {
    const { customer, summaryAmount, items, payment } = req.body;

    try {
        const customerRef = await Customer.findOne({ Id: (customer === undefined ? "WG" : customer) });
        const itemsWithObjectId = items.map(item => ({
            ...item,
            variant: new mongoose.Types.ObjectId(item.variant)
        }));

        const newOrder = new Order({
            Id: await generateOrderNumber(payment.method, payment.type, false),
            customer: customerRef._id,
            cashier: new mongoose.Types.ObjectId(req.user._id),
            summaryAmount,
            items: itemsWithObjectId,
            payment
        });

        await newOrder.save();

        return res.status(201).json({ success: true, title: 'Created!', message: 'Order created successfully.', order: newOrder });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const get = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findOne({ Id: orderId });
        if (!order) {
            return res.status(400).json({ message: 'Order not found' });
        }

        return res.status(200).json({ success: true, order: order });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const update = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.orderId, req.body, { new: true });
        if (!updatedOrder) {
            return res.status(400).json({ message: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const remove = async (req, res) => {
    const { orderId } = req.body;

    try {
        const deletedOrder = await Order.findOneAndDelete({ Id: orderId });
        if (!deletedOrder) {
            return res.status(400).json({ message: 'Order not found' });
        }

        return res.status(200).json({ success: true, title: 'Deleted!', message: 'Order deleted successfully.', order: deletedOrder });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const renderInvoice = async (req, res, next) => {
    const orderId = req.params.orderId;

    try {
        let order = await Order.findOne({ Id: orderId })
            .populate({
                path: 'customer',
                select: 'name'
            })
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
            .exec();

        if (!order) {
            return next(createError(404));
        }

        order = {
            Id: order.Id,
            customer: order.customer.name,
            cashier: order.cashier.profile.name,
            date: formatDateTime(order.created),
            summaryAmount: {
                subTotal: formatCurrency(order.summaryAmount.subTotal),
                discount: formatCurrency(order.summaryAmount.discount),
                voucher: formatCurrency(order.summaryAmount.voucher),
                totalAmount: formatCurrency(order.summaryAmount.totalAmount),
            },
            payment: {
                method: order.payment.method,
                type: order.payment.type,
                receive: formatCurrency(order.payment.receive),
                change: formatCurrency(order.payment.change)
            },
            items: order.items.map(item => ({
                name: item.variant.product.name,
                color: item.variant.color,
                barcode: item.variant.barcode,
                quantity: item.quantity,
                price: formatCurrency(item.price),
                amount: formatCurrency(item.amount)
            }))
        }

        return res.render('invoice', { layout: null, order: order });
    } catch (error) {
        console.error('Error rendering invoice:', error);
        return next(createError(500));
    }
}

const getByTimeFrame = async (req, res) => {
    const { timeframe, startDate, endDate } = req.body;

    try {
        let report = await getReport(timeframe, startDate, endDate);

        let oldReport;
        if (timeframe === 'today') {
            oldReport = await getReport('yesterday');
        } else if (timeframe === 'thisweek') {
            oldReport = await getReport('previousweek');
        } else if (timeframe === 'thismonth') {
            oldReport = await getReport('previousmonth');
        }

        if (oldReport) {
            const currentSales = report.analytics.totalSales;
            const curentOrders = report.analytics.totalOrders;
            const oldSales = oldReport.analytics.totalSales;
            const oldOrders = oldReport.analytics.totalOrders;

            report.analytics.percentSales = (oldSales !== 0) ? Math.round((currentSales - oldSales) / oldSales * 100) : 0;
            report.analytics.percentOrders = (oldOrders !== 0) ? Math.round((curentOrders - oldOrders) / oldOrders * 100) : 0;
            report.analytics.diffRevenue = report.analytics.revenue - oldReport.analytics.revenue;
        }

        return res.json(report);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

function getFilterByTimeFrame(timeframe, startDate, endDate) {
    const today = new Date();
    switch (timeframe) {
        case 'today':
            return {
                created: {
                    $gte: new Date(today.setHours(0, 0, 0, 0)),
                    $lt: new Date(today.setHours(23, 59, 59, 999))
                }
            };

        case 'yesterday':
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            return {
                created: {
                    $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
                    $lt: new Date(yesterday.setHours(23, 59, 59, 999))
                }
            };

        case 'last7days':
            const last7days = new Date();
            last7days.setDate(today.getDate() - 7);
            return {
                created: {
                    $gte: new Date(last7days.setHours(0, 0, 0, 0)),
                    $lt: new Date(today.setHours(23, 59, 59, 999))
                }
            };

        case 'thisweek':
            const startOfWeek = new Date();
            startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() - today.getDay() + 7);

            return {
                created: {
                    $gte: new Date(startOfWeek.setHours(0, 0, 0, 0)),
                    $lt: new Date(endOfWeek.setHours(23, 59, 59, 999))
                }
            };

        case 'previousweek':
            const startOfPreviousWeek = new Date();
            startOfPreviousWeek.setDate(today.getDate() - today.getDay() - 6);

            const endOfPreviousWeek = new Date(today);
            endOfPreviousWeek.setDate(today.getDate() - today.getDay());

            return {
                created: {
                    $gte: new Date(startOfPreviousWeek.setHours(0, 0, 0, 0)),
                    $lt: new Date(endOfPreviousWeek.setHours(23, 59, 59, 999))
                }
            };

        case 'thismonth':
            return {
                created: {
                    $gte: new Date(today.getFullYear(), today.getMonth(), 1),
                    $lt: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
                }
            };

        case 'previousmonth':
            const startOfPreviousMonth = new Date();
            startOfPreviousMonth.setMonth(today.getMonth() - 1, 1);

            const endOfPreviousMonth = new Date(today);
            endOfPreviousMonth.setDate(0);

            return {
                created: {
                    $gte: new Date(startOfPreviousMonth.setHours(0, 0, 0, 0)),
                    $lt: new Date(endOfPreviousMonth.setHours(23, 59, 59, 999))
                }
            };

        case 'custom':
            if (startDate && endDate) {
                return {
                    created: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate).setHours(23, 59, 59, 999)
                    }
                };
            }
    }
}

async function getReport(timeframe, startDate, endDate) {
    const filter = getFilterByTimeFrame(timeframe, startDate, endDate);

    let analytics = {
        totalSales: 0,
        totalOrders: 0,
        revenue: 0,
        variantContribution: {}
    };

    let orders = await Order.find(filter)
        .populate({
            path: 'customer',
            select: 'name'
        })
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
        let totalVariantQuantity = 0;

        orders = orders.map(order => {
            const sales = order.summaryAmount.totalAmount;
            const orderItems = order.items.map(item => {
                const variant = item.variant;
                const quantity = item.quantity;

                const barcode = variant.barcode.replace(/\s/g, '');
                analytics.variantContribution[barcode] = (analytics.variantContribution[barcode] || 0) + quantity;
                totalVariantQuantity += quantity;

                return {
                    variant: {
                        name: variant.product.name,
                        color: variant.color,
                        barcode: barcode,
                        cost: variant.cost,
                        price: variant.price
                    },
                    quantity
                };
            });

            analytics.totalSales += sales;
            analytics.totalOrders++;
            analytics.revenue += orderItems.reduce((itemRevenue, item) =>
                itemRevenue + item.quantity * (item.variant.price - item.variant.cost), 0);

            return {
                Id: order.Id,
                date: formatDateTime(order.created),
                sales,
                items: orderItems
            };
        });

        for (const barcode in analytics.variantContribution) {
            if (analytics.variantContribution.hasOwnProperty(barcode)) {
                analytics.variantContribution[barcode] = Math.round((analytics.variantContribution[barcode] / totalVariantQuantity) * 100);
            }
        }
    }

    return { orders, analytics, filter };
}

module.exports = { get, getByTimeFrame, create, update, remove, renderInvoice };
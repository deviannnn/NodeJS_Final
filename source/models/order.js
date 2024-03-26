const mongoose = require('mongoose');
const Variant = require('./variant');

const orderSchema = new mongoose.Schema({
    Id: { type: String, unique: true, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    summaryAmount: {
        subTotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        voucher: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true }
    },
    items: [{
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        amount: { type: Number, required: true }
    }],
    payment: {
        method: { type: String, required: true, enum: ['cash', 'banking'], default: 'cash' },
        receive: { type: Number, required: true },
        change: { type: Number, required: true },
        type: { type: String, required: true, enum: ['full payment', 'installment'], default: 'full payment' },
        remainAmount: { type: Number, required: true, default: 0 }
    },
    created: { type: Date, default: Date.now },
    updated: [{
        Id: { type: String, required: true },
        name: { type: String, required: true },
        datetime: { type: Date, required: true, default: Date.now },
    }]
});

orderSchema.pre('save', async function (next) {
    const items = this.items || [];

    for (const item of items) {
        try {
            const variant = await Variant.findById(item.variant);
            if (variant) {
                variant.quantity -= item.quantity;
                variant.timeline.push({
                    quantity: -1*item.quantity,
                    action: 'sell',
                    datetime: new Date(),
                });
                await variant.save();
            }
        } catch (error) {
            console.error(`Error updating variant quantity for item ${item.variant}: ${error.message}`);
            throw error;
        }
    }

    next();
});

orderSchema.statics.getNextOrderNo = async function () {
    try {
        const today = new Date();

        const ordersInDay = await this.find({ created: { $gte: today.setHours(0, 0, 0, 0) } });

        if (ordersInDay.length > 0) {
            const sortedOrders = ordersInDay.sort((a, b) => {
                const last3DigitsA = parseInt(a.Id.substring(11), 10);
                const last3DigitsB = parseInt(b.Id.substring(11), 10);
                return last3DigitsB - last3DigitsA;
            });

            const lastON = parseInt(sortedOrders[0].Id.substring(11), 10);
            return lastON + 1;
        }

        return 1;
    } catch (error) {
        console.error('Error getting next order number:', error);
        throw error;
    }
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
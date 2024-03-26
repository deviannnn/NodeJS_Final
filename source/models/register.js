const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
    cashier: {
        Id: { type: String, unique: true, required: true },
        name: { type: String, unique: true, required: true }
    },
    opened: { type: Date, required: true, default: Date.now },
    closed: { type: Date },
    initialAmount: { type: Number, required: true },
    closingAmount: { type: Number },
    transactions: [{
        type: { type: String, required: true, enum: ['income', 'expense'] },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now }
    }],
    status: { type: String, required: true, enum: ['open', 'closed'], default: 'open' }
});

const Register = mongoose.model('Register', registerSchema);

module.exports = Register;

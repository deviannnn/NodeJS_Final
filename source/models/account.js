const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    Id: { type: String, unique: true, required: true },
    gmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {
        name: { type: String, required: true },
        gender: { type: String, required: true, enum: ['male', 'female'] },
        birthday: { type: Date, required: true },
        phone: { type: String, required: true, unique: true },
        address: {
            num: { type: String, required: true },
            street: { type: String, required: true },
            ward: { type: String, required: true },
            district: { type: String, required: true },
            city: { type: String, required: true }
        },
        avatar: { type: String, required: true },
    },
    role: { type: String, required: true, enum: ['admin', 'staff'], default: 'staff' },
    locked: { type: Boolean, required: true, default: false },
    actived: { type: Boolean, required: true, default: false },
    created: {
        Id: { type: String, required: true, default: 'Init' },
        name: { type: String, required: true, default: 'Init' },
        datetime: { type: Date, required: true, default: Date.now },
    },
    updated: [{
        Id: { type: String, required: true, default: 'Init' },
        name: { type: String, required: true, default: 'Init' },
        datetime: { type: Date, required: true, default: Date.now },
    }]
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
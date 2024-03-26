const Order = require('../models/order');

const generateId = (prefix) => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${randomNum}`;
};

const generateOrderNumber = async (payMethod, payType, voucher) => {
    const today = new Date();
    const orderNo = await Order.getNextOrderNo();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).substring(-4);
    const payMethodStr = payMethod === 'banking' ? '1' : '0';
    const payTypeStr = payType === 'installment' ? '1' : '0';
    const voucherStr = voucher ? '1' : '0';
    const orderNoStr = String(orderNo).padStart(3, '0');

    return `${day}${month}${year}${payMethodStr}${payTypeStr}${voucherStr}${orderNoStr}`;
}

module.exports = { generateId, generateOrderNumber };
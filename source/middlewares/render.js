const Account = require('../models/account');

const renderAvatar = async (req, res, next) => {
    res.locals.user = req.user;
    res.locals.hello = req.session.hello;
    delete req.session.hello;

    try {
        const account = await Account.findOne({ Id: req.user.Id });
        res.locals.avatar = account.profile.avatar;
    } catch (error) {
        res.avatar = 'default';
    }

    next();
}

module.exports = { renderAvatar }
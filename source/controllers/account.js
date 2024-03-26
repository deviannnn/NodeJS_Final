const Account = require('../models/account');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const get = require('lodash/get');
const set = require('lodash/set');

const domain = process.env.DOMAIN;

const { generateJWT } = require('../utils/jwt');
const { formatForBirthdayInput } = require('../utils/format');
const { generateId } = require('../utils/auto-id');
const { sendEmail } = require('../utils/send-mail');
const { revokedTokens } = require('../middlewares/auth');

const register_mail = path.join(process.cwd(), 'public/assets/html/register_mail.html');
const password_reset_mail = path.join(process.cwd(), 'public/assets/html/password_reset_mail.html');

const register = async (req, res) => {
    const { gmail, name, gender, birthday, phone, num, street, ward, district, city } = req.body;

    try {
        const hashedPassword = bcrypt.hashSync(gmail.split('@')[0], 10);

        const newAccount = new Account({
            Id: generateId('STF'),
            gmail: gmail,
            password: hashedPassword,
            profile: {
                name: name,
                gender: gender,
                birthday: birthday,
                phone: phone,
                address: { num: num, street: street, ward: ward, district: district, city: city },
                avatar: 'default.png'
            },
            created: {
                Id: req.user.Id,
                name: req.user.name
            }
        });

        await newAccount.save();

        const token = await generateJWT(newAccount, 'password_change');

        const send = await sendPasswordChange(newAccount.gmail, token, register_mail);
        if (send.success) {
            return res.status(201).json({ success: true, title: 'Registed!', message: `Account registered & Gmail sent successfully.` });
        } else {
            return res.status(201).json({ success: true, title: 'Registed!', message: `Account registered successfully but ${send.message}.` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const account = await Account.findOne({ gmail: `${username}@gmail.com` });

        if (!account || !bcrypt.compareSync(password, account.password)) {
            return res.status(400).json({ success: false, message: 'Invalid username or password.' });
        }
        if (account.locked === true) {
            return res.status(400).json({ success: false, message: 'You cannot access the system because your account has been locked.' });
        }
        if (account.actived === false) {
            return res.status(400).json({ success: false, message: 'Please login by clicking on the link in your gmail.' });
        }

        const token = await generateJWT(account, 'login');

        res.cookie('jwt', token, { httpOnly: true });
        req.session.hello = account.profile.name;

        return res.status(200).json({ success: true, token: token });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const logout = (req, res) => {
    const token = req.cookies['jwt'];

    revokedTokens.add(token);

    res.clearCookie('jwt');
    return res.redirect('/');
};

const passwordReset = async (req, res) => {
    const value = req.body.value;

    try {
        let filter = {};

        if (/^\w+([\.-]?\w+)*@gmail\.com$/.test(value)) {
            filter = { gmail: value };
        } else if (/^\d{10,11}$/.test(value)) {
            filter = { 'profile.phone': value };
        } else if (/^[A-Za-z]{3}\d{8}$/.test(value)) {
            filter = { Id: value };
        } else {
            return res.status(400).json({ success: false, message: 'Account not found.' });
        }

        const account = await Account.findOne(filter);

        if (!account) {
            return res.status(400).json({ success: false, message: 'Account not found.' });
        }
        if (account.locked === true) {
            return res.status(400).json({ success: false, message: 'You cannot access the system because your account has been locked.' });
        }
        if (account.actived === false) {
            return res.status(400).json({ success: false, message: 'Please login by clicking on the link in your gmail.' });
        }

        const token = await generateJWT(account, 'password_change');

        const send = await sendPasswordChange(account.gmail, token, password_reset_mail);
        if (send.success) {
            return res.status(200).json({
                success: true, title: 'Gmail sent!',
                message: `We sent a gmail to ${hideMailPart(account.gmail)} with a link to get back into your account. This one is only valid for 1 minute!`,
            });
        } else {
            return res.status(400).json({ success: false, message: `${send.message}.` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const passwordChange = async (req, res) => {
    const { accountId, newPassword, confirmPassword } = req.body;
    const Id = req.user.Id;

    try {
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }
        if (accountId !== Id) {
            return res.status(400).json({ success: false, message: 'An error occurred. Please try again later.' });
        }
        const account = await Account.findOne({ Id: accountId });
        if (!account) {
            return res.status(400).json({ success: false, message: 'Account not found.' });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        account.password = hashedNewPassword;

        if (account.actived === false) {
            account.actived = true;
        }

        account.updated.push({
            Id: accountId,
            name: req.user.name,
            datetime: Date.now(),
        });

        await account.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Password changed successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const passwordUpdate = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const Id = req.user.Id;

    try {
        if (newPassword.length >= 6 && newPassword !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match.' });
        }

        const account = await Account.findOne({ Id });
        if (!account || !bcrypt.compareSync(currentPassword, account.password)) {
            return res.status(400).json({ success: false, message: 'Invalid current password.' });
        }

        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        account.password = hashedNewPassword;

        account.updated.push({
            Id: req.user.Id,
            name: req.user.name,
            datetime: Date.now(),
        });

        await account.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Password updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const resendMail = async (req, res) => {
    const { Id } = req.body;

    try {
        const account = await Account.findOne({ Id });
        if (!account) {
            return res.status(400).json({ success: false, message: 'Account not found.' });
        }

        const token = await generateJWT(account, 'password_change');

        const send = await sendPasswordChange(account.gmail, token, register_mail);
        if (send.success) {
            return res.status(200).json({ success: true, title: 'Sent!', message: `Gmail sent successfully.` });
        } else {
            return res.status(200).json({ success: false, message: `${send.message}.` });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getAll = async (req, res) => {
    try {
        const accounts = await Account.find({ role: 'staff' });

        res.status(200).json({ success: true, accounts: accounts });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const getByID = async (req, res) => {
    const { Id } = req.body;

    try {
        const account = await Account.findOne({ Id });
        if (!account) {
            return res.status(400).json({ success: false, message: 'Account not found.' });
        }

        return res.status(200).json({ success: true, account: account });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

const update = async (req, res) => {
    const { Id, gmail, name, gender, birthday, phone, num, street, ward, district, city, role, locked } = req.body;

    try {
        const updatedAccount = await Account.findOne({ Id });

        let diff = false;
        const updateFields = {
            gmail,
            'profile.name': name,
            'profile.gender': gender,
            'profile.phone': phone,
            'profile.address.num': num,
            'profile.address.street': street,
            'profile.address.ward': ward,
            'profile.address.district': district,
            'profile.address.city': city,
            role,
            locked,
        };

        for (const [key, value] of Object.entries(updateFields)) {
            if (value !== undefined && value !== get(updatedAccount, key)) {
                set(updatedAccount, key, value);
                diff = true;
            }
        }
        if (birthday !== undefined && birthday !== updatedAccount.profile.birthday.toISOString().slice(0, 10)) {
            updatedAccount.profile.birthday = birthday;
            diff = true;
        }

        if (!diff) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        updatedAccount.updated.push({
            Id: req.user.Id,
            name: req.user.name,
            datetime: Date.now(),
        });

        await updatedAccount.save();

        return res.status(200).json({ success: true, title: 'Updated!', message: 'Account updated successfully.', account: updatedAccount });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const remove = async (req, res) => {
    const { Id } = req.body;

    try {
        const deletedAccount = await Account.findOne({ Id });
        if (!deletedAccount) {
            return res.status(404).json({ success: false, message: 'Account not found.' });
        }

        const orderWithAccount = await Order.exists({ cashier: deletedAccount._id });
        if (orderWithAccount) {
            return res.status(400).json({ success: false, message: 'Cannot delete. There are orders associated with it.' });
        }

        await Account.deleteOne({ Id });

        return res.status(200).json({ success: true, title: 'Deleted!', message: 'Account deleted successfully.', account: deletedAccount });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const uploadAvt = async (req, res) => {
    const { Id } = req.body;

    try {
        const uploadAccount = await Account.findOne({ Id });
        if (!uploadAccount) {
            return res.json({ success: false, message: 'Account not found.' });
        }

        if (req.file !== undefined) {
            uploadAccount.profile.avatar = req.file.filename;
            await uploadAccount.save();

            return res.json({ success: true, title: 'Uploaded!', message: 'Avatar uploaded successfully.' });
        } else {
            return res.json({ success: false, message: 'Fail to upload avatar.' });
        }
    } catch (error) {
        return res.json({ success: false, message: 'Internal Server Error.' });
    }
}

const sendPasswordChange = async (gmail, token, template) => {
    const link = `${domain}/password/change?token=${token}`
    const mailSubject = template === register_mail ? 'Confirm your registration' : 'Confirm your password reset';
    let mailHtml = fs.readFileSync(template, 'utf8');
    mailHtml = `<p>${mailHtml.replace(/{{LINK_PLACEHOLDER}}/g, link)}</p>`;

    return await sendEmail(gmail, mailSubject, mailHtml);
}

const hideMailPart = (mail) => {
    const atIndex = mail.indexOf('@');
    const visiblePart = mail.substring(0, Math.min(atIndex, 2)) + '****' + mail.substring(atIndex);
    return visiblePart;
};

const renderProfile = async (req, res, next) => {
    try {
        const account = await Account.findOne({ Id: req.user.Id });
        if (!account) {
            return next(createError(404));
        }

        const profile = {
            Id: account.Id,
            avatar: account.profile.avatar,
            role: account.role,
            name: account.profile.name,
            gender: account.profile.gender,
            birthday: formatForBirthdayInput(account.profile.birthday),
            gmail: account.gmail,
            phone: account.profile.phone,
            address: account.profile.address
        };

        res.render('account_profile', { title: "Profile", subTitle: 'Profile', profile: profile, script: 'account_profile' });
    } catch (error) {
        return next(error);
    }
}

const renderList = (req, res) => {
    res.render('account_list', { title: 'Accounts', subTitle: 'Account List', script: 'account_list' });
}

const renderRegister = (req, res) => {
    res.render('account_register', { title: 'Accounts', subTitle: 'New Account', script: 'account_register' });
}

const renderLogin = (req, res) => {
    res.render('login', { layout: 'pre_layout', script: 'account_login' });
}

const renderPasswordReset = (req, res) => {
    res.render('password_reset', { layout: 'pre_layout', script: 'account_password_reset' });
}

const renderPasswordChange = (req, res) => {
    res.render('password_change', { layout: 'pre_layout', user: req.user, script: 'account_password_change' });
}

module.exports = {
    register, login, logout, passwordReset, passwordChange, passwordUpdate, resendMail,
    getAll, getByID, update, remove, uploadAvt, renderProfile, renderList, renderRegister, renderLogin,
    renderPasswordReset, renderPasswordChange
};
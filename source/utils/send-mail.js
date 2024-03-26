const nodemailer = require('nodemailer');

const mailPassword = process.env.MAIL_PASSWORD;

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lytuanan1911@gmail.com',
            pass: mailPassword
        }
    });

    const mailOptions = {
        from: 'STARBOY <lytuanan1911@gmail.com>',
        to,
        subject,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        return { success: false, message: `Error sending email: ${error}` };
    }
};

module.exports = { sendEmail };
const nodemailer = require('nodemailer');

const SendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: `ToDo App <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    }

    // 3. Send the email
    await transporter.sendMail(mailOptions);
}

module.exports = SendEmail;
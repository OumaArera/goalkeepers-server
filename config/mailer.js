// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: parseInt(process.env.MAIL_PORT),
//   secure: process.env.MAIL_SECURE === 'true', // true for 465, false for 587
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS
//   }
// });

// module.exports = transporter;

const axios = require('axios');

const sendMail = async ({ to, subject, text }) => {
  try {
    const response = await axios.post(process.env.EMAIL_API_URL, {
      sender_id: process.env.EMAIL_SENDER_ID,
      recipient: to,
      subject,
      message: text
    }, {
      headers: {
        Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (err) {
    console.error('Email API Error:', err.response ? err.response.data : err.message);
    throw new Error('Failed to send email via external email API.');
  }
};

module.exports = sendMail;


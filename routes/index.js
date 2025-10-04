const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for port 465, false for others
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


router.post('/send-email', async (req, res, next) => {

  const { from,  username, message, theme = "не задано" } = req.body;

  try {
    const info = await transporter.sendMail({
      from: `"Dome.am" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Новое сообщение с сайта Dome.am от ${from}`,
      html: `
       <h1><span style='color:#4834d4'>Тема: </span>${theme}</h1>
       <h1><span style='color:#4834d4'>Отправитель: </span>${username}</h1>
       <hr />
       <p>${message}</p>
       `,
    });

    res.status(200).json({
      message: "Email sent successfully",
      info: info,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      message: "Error sending email",
      error: error.message,
    });
  }
})

module.exports = router;
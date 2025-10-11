const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");

// Rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // 3 emails per minute per IP

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Rate limiter middleware
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const userRequests = rateLimitMap.get(ip) || [];

  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (recentRequests.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests. Please try again later."
    });
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  next();
};

router.post('/send-email', rateLimiter, async (req, res, _next) => {
  const { from, username, message, theme = "не задано" } = req.body;

  // Validation
  if (!from || !username || !message) {
    return res.status(400).json({
      error: "Missing required fields: from, username, message"
    });
  }

  if (!isValidEmail(from)) {
    return res.status(400).json({
      error: "Invalid email format"
    });
  }

  if (message.length > 5000) {
    return res.status(400).json({
      error: "Message too long (max 5000 characters)"
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Dome.am" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Новое сообщение с сайта Dome.am от ${from}`,
      html: `
       <h1><span style='color:#4834d4'>Тема: </span>${theme}</h1>
       <h1><span style='color:#4834d4'>Отправитель: </span>${username}</h1>
       <h2><span style='color:#4834d4'>Email: </span>${from}</h2>
       <hr />
       <p>${message}</p>
       `,
    });

    res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Email error:', error);

    res.status(500).json({
      error: "Error sending email. Please try again later."
    });
  }
})

module.exports = router;
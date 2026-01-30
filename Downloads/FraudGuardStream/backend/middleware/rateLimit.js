/*
 * Instagram Clone - Rate Limiting Middleware
 * Created by Phumeh
 */

const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts, please try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'Upload limit reached, please try again later.' }
});

module.exports = { generalLimiter, authLimiter, uploadLimiter };

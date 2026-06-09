const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs for auth routes
    message: {
        message: "Too many login attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
})

const contactLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 contact form submissions per windowMs
    message: {
        message: "Too many contact form submissions from this IP, please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
})

const inquiryLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 tour inquiry submissions per windowMs
    message: {
        message: "Too many tour inquiries from this IP, please try again after an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = {
    apiLimiter,
    authLimiter,
    contactLimiter,
    inquiryLimiter
};
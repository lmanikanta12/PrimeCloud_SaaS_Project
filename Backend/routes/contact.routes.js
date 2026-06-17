const express = require('express');
const router = express.Router();
const { sendContactMessage } = require('../controllers/contact.controller'); // make sure controller name matches
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// ---------------- CONTACT FORM ROUTE ----------------
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('countryCode').notEmpty().withMessage('Country code is required'),
    body('message').notEmpty().withMessage('Message is required'),
    // Optional fields; only validate format if provided
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    body('educationOrJobRole').optional().isLength({ max: 100 }).withMessage('Too long'),
  ],
  validate,
  sendContactMessage
);

module.exports = router;
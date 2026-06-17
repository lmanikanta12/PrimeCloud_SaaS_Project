const express = require('express');
const router = express.Router();
const { signup, signin, forgotResetPassword } = require('../controllers/auth.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// ---------------- SIGNUP ----------------
router.post(
  '/signup',
  [
    body('fullName').notEmpty().withMessage('Full Name is required'),
    body('email').isEmail().withMessage('Valid Email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('confirmPassword').notEmpty().withMessage('Confirm Password required'),
  ],
  validate,
  signup
);

// ---------------- SIGNIN ----------------
router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Valid Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  signin
);

// ---------------- FORGOT / RESET PASSWORD ----------------
router.post(
  '/forgot-reset',
  [
    body('email').isEmail().withMessage('Valid Email is required'),
  ],
  validate,
  forgotResetPassword
);

module.exports = router;
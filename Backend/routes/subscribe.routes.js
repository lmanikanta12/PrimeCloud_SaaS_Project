const express = require('express');
const router = express.Router();
const { subscribe, getSubscriberCount } = require('../controllers/subscribe.controller');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Subscribe form
router.post(
  '/subscribe',
  [body('email').isEmail().withMessage('Valid Email is required')],
  validate,
  subscribe
);

// Get subscriber count
router.get('/count', getSubscriberCount);

module.exports = router;
const express = require('express');
const router = express.Router();

// ---------------- HEALTH CHECK ----------------
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
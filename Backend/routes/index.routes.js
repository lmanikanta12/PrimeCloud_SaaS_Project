const express = require('express');
const router = express.Router();

// Import all route modules
const contactRoutes = require('./contact.routes');
const subscribeRoutes = require('./subscribe.routes');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const pricingRoutes = require('./pricing.routes'); // ✅ ADD THIS

// ---------------- MAIN ROUTES ----------------
router.use('/contact', contactRoutes);
router.use('/subscribe', subscribeRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/pricing', pricingRoutes); // ✅ ADD THIS

module.exports = router;
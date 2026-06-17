const express = require("express");
const router = express.Router();

const protect = require("../middleware/protect");

const {
  createOrder,
  verifyPayment,
  activateFreePlan,
  getMyPlans,
} = require("../controllers/pricing.controller");

// ==============================
// 💳 CREATE RAZORPAY ORDER
// ==============================
router.post("/create-order", protect, createOrder);

// ==============================
// 🔐 VERIFY PAYMENT
// ==============================
router.post("/verify", protect, verifyPayment);

// ==============================
// 🆓 FREE PLAN
// ==============================
router.post("/free", protect, activateFreePlan);

// ==============================
// 👤 GET USER PLAN
// ==============================
router.get("/me", protect, getMyPlans);

module.exports = router;
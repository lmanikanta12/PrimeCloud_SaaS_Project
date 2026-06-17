const crypto = require("crypto");
const razorpay = require("../services/razorpay.service");
const Pricing = require("../models/pricing.model");
const plans = require("../config/plans");
const { sendEmail } = require("../services/email.service");

// ==============================
// CREATE ORDER (RAZORPAY)
// ==============================
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // paisa
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ==============================
// VERIFY PAYMENT + SAVE PLAN
// ==============================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      amount
    } = req.body;

    const selectedPlan = plans[plan];

    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    // 🔐 VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment" });
    }

    // 📅 OPTIONAL: SET EXPIRY (example: 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 💾 SAVE PLAN
    const pricing = await Pricing.create({
      user: req.user._id,
      plan,
      amount,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      features: selectedPlan.features,
      status: "active",
      expiresAt
    });

    // ---------------- EMAIL TO USER ----------------
    await sendEmail({
      to: req.user.email,
      subject: "Your Plan Activated 🚀",
      html: `
        <h2>Plan Activated Successfully</h2>

        <p>Hi <strong>${req.user.fullName}</strong>,</p>

        <p>Your <strong>${plan.toUpperCase()}</strong> plan is now active.</p>

        <p><strong>Amount Paid:</strong> ₹${amount}</p>

        <h3>Features Included:</h3>
        <ul>
          ${selectedPlan.features.map(f => `<li>${f}</li>`).join("")}
        </ul>

        <p style="margin-top:20px;">
        Thank you for choosing PrimeCloud 💙
        </p>
      `
    });

    // ---------------- EMAIL TO ADMIN ----------------
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Subscription Purchased 💰",
      html: `
        <h2>New Subscription Alert</h2>

        <p>A user has purchased a plan on <strong>PrimeCloud</strong>.</p>

        <table style="margin-top:15px;font-size:14px;">
          <tr><td><strong>Name:</strong></td><td>${req.user.fullName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${req.user.email}</td></tr>
          <tr><td><strong>Plan:</strong></td><td>${plan.toUpperCase()}</td></tr>
          <tr><td><strong>Amount:</strong></td><td>₹${amount}</td></tr>
          <tr><td><strong>Payment ID:</strong></td><td>${razorpay_payment_id}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleString()}</td></tr>
        </table>
      `
    });

    res.status(200).json({
      message: "Payment verified & plan activated",
      data: pricing
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ==============================
// FREE PLAN (NO PAYMENT)
// ==============================
exports.activateFreePlan = async (req, res) => {
  try {
    const selectedPlan = plans["free"];

    const pricing = await Pricing.create({
      user: req.user._id,
      plan: "free",
      amount: 0,
      order_id: "FREE",
      payment_id: "FREE",
      signature: "FREE",
      features: selectedPlan.features,
      status: "active",
    });

    // ---------------- EMAIL TO USER ----------------
    await sendEmail({
      to: req.user.email,
      subject: "Your Free Plan Activated 🎉",
      html: `
        <h2>Free Plan Activated Successfully</h2>
        <p>Hi <strong>${req.user.fullName}</strong>,</p>
        <p>Your <strong>FREE</strong> plan is now active.</p>
        <h3>Features Included:</h3>
        <ul>
          ${selectedPlan.features.map(f => `<li>${f}</li>`).join("")}
        </ul>
        <p style="margin-top:20px;">Thank you for choosing PrimeCloud 💙</p>
      `
    });

    // ---------------- EMAIL TO ADMIN ----------------
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "New Free Plan Activated",
      html: `
        <h2>New Free Plan Activation</h2>
        <p>A user has activated a FREE plan on <strong>PrimeCloud</strong>.</p>
        <table style="margin-top:15px;font-size:14px;">
          <tr><td><strong>Name:</strong></td><td>${req.user.fullName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${req.user.email}</td></tr>
          <tr><td><strong>Plan:</strong></td><td>FREE</td></tr>
          <tr><td><strong>Amount:</strong></td><td>₹0</td></tr>
          <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleString()}</td></tr>
        </table>
      `
    });

    res.status(201).json({
      message: "Free plan activated",
      data: pricing
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Free plan failed" });
  }
};

// ==============================
// GET MY PLAN
// ==============================
exports.getMyPlans = async (req, res) => {
  try {
    const plans = await Pricing.find({
      user: req.user._id,
      status: "active"
    }).sort({ createdAt: -1 });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};
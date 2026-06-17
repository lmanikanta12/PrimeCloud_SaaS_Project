const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: String,
      required: true,
      enum: ["free", "standard", "premium", "advanced", "enterprise"], // ✅ your plans
    },

    amount: {
      type: Number,
      required: true,
    },

    // 🔥 Razorpay fields
    order_id: {
      type: String,
      required: true,
    },

    payment_id: {
      type: String,
      required: true,
    },

    signature: {
      type: String,
      required: true,
    },

    // 📅 expiry (for monthly/yearly later)
    expiresAt: {
      type: Date,
    },

    features: [
      {
        type: String,
      }
    ],

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pricing", pricingSchema);
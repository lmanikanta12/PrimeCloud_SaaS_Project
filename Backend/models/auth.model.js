const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    resetOTP: { type: String, default: null }, // For forgot password
    resetOTPExpire: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return; // no need to call next
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method for login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// OTP validation method
userSchema.methods.isOTPValid = function (otp) {
  if (!this.resetOTP || !this.resetOTPExpire) return false;
  const now = new Date();
  return this.resetOTP === otp && this.resetOTPExpire > now;
};

module.exports = mongoose.model('User', userSchema);
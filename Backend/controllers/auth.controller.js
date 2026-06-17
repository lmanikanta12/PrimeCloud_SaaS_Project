const User = require('../models/auth.model');
const { sendEmail } = require('../services/email.service');
const jwt = require("jsonwebtoken"); // add at top if not added


// ---------------- SIGN UP ----------------
exports.signup = async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ fullName, email, password });

    // Send welcome email to user
    await sendEmail({
      to: email,
      subject: 'Welcome to PrimeCloud',
      html: `
        <h2>Welcome to PrimeCloud 🚀</h2>

        <p>Hi <strong>${fullName}</strong>,</p>

        <p>Your PrimeCloud account has been successfully created.</p>

        <p>You can now access our platform and explore our cloud solutions, tools, and services.</p>

        <div style="
          background:#f4f6fb;
          padding:15px;
          border-left:4px solid #ff7a18;
          border-radius:8px;
          margin-top:15px;
        ">
          Your account email: <strong>${email}</strong>
        </div>

        <p style="margin-top:20px;">
        If you did not create this account, please ignore this email.
        </p>

        <p style="margin-top:25px;">
        Best regards,<br>
        <strong>PrimeCloud Team</strong>
        </p>

        <hr style="margin-top:30px;">

        <p style="font-size:12px;color:#888;">
        This is an automated message from PrimeCloud. Please do not reply directly to this email.
        </p>
      `
    });

    // Notify admin about new signup
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New User Signed Up',
      html: `
        <h2>New User Registration</h2>

        <p>A new user has created an account on <strong>PrimeCloud</strong>.</p>

        <table style="margin-top:15px;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 10px;"><strong>Name:</strong></td>
            <td>${fullName}</td>
          </tr>

          <tr>
            <td style="padding:6px 10px;"><strong>Email:</strong></td>
            <td>${email}</td>
          </tr>

          <tr>
            <td style="padding:6px 10px;"><strong>Registered At:</strong></td>
            <td>${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <hr style="margin-top:25px;">

        <p style="font-size:12px;color:#888;">
        PrimeCloud System Notification
        </p>
      `
    });

    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



// ---------------- SIGN IN ----------------
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);

    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SEND TOKEN
    // res.status(200).json({
    //   message: 'Sign in successful',
    //   token: token
    // });
    res.status(200).json({
      message: 'Sign in successful',
      token: token,
      user: {
        fullName: user.fullName,
        email: user.email
            }
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------------- FORGOT / RESET PASSWORD ----------------
exports.forgotResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: 'User not found' });


    // ---------------- SEND OTP ----------------
    if (!otp && !newPassword) {

      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetOTP = generatedOTP;
      user.resetOTPExpire = Date.now() + 10 * 60 * 1000;

      await user.save();

      // Send OTP email
      await sendEmail({
        to: email,
        subject: 'PrimeCloud Password Reset OTP',
        html: `
          <h2>Password Reset Request</h2>

          <p>We received a request to reset your PrimeCloud account password.</p>

          <p>Your One-Time Password (OTP) is:</p>

          <div style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:4px;
            background:#f4f6fb;
            padding:15px;
            text-align:center;
            border-radius:8px;
            border-left:4px solid #ff7a18;
            margin-top:10px;
          ">
            ${generatedOTP}
          </div>

          <p style="margin-top:15px;">
          This OTP will expire in <strong>10 minutes</strong>.
          </p>

          <p>If you did not request this password reset, please ignore this email.</p>

          <hr style="margin-top:25px;">

          <p style="font-size:12px;color:#888;">
          PrimeCloud Security Notification
          </p>
        `
      });

      return res.status(200).json({ message: 'OTP sent to email' });

    }


    // ---------------- RESET PASSWORD ----------------
    if (!user.isOTPValid(otp))
      return res.status(400).json({ message: 'Invalid or expired OTP' });


    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpire = null;

    await user.save();


    // Notify user password changed
    await sendEmail({
      to: email,
      subject: 'Password Reset Successful',
      html: `
        <h2>Password Reset Successful</h2>

        <p>Your PrimeCloud account password has been successfully updated.</p>

        <p>If you performed this action, no further steps are required.</p>

        <p>If you did not reset your password, please secure your account immediately.</p>

        <hr style="margin-top:25px;">

        <p style="font-size:12px;color:#888;">
        PrimeCloud Security Team
        </p>
      `
    });

    return res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {

    console.error(error);
    return res.status(500).json({ message: 'Server error' });

  }
};
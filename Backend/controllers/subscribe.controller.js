const Subscribe = require('../models/subscribe.model');
const { sendEmail } = require('../services/email.service');
const asyncHandler = require('../middleware/asyncHandler');

// ---------------- SUBSCRIBE ----------------
exports.subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Check if already subscribed
  const existing = await Subscribe.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already subscribed' });

  // Create new subscription
  const subscription = await Subscribe.create({ email });

  // ---------------- EMAIL TO SUBSCRIBER ----------------
  await sendEmail({
    to: email,
    subject: 'Subscribed to PrimeCloud Updates',
    html: `
      <h2>Welcome to PrimeCloud Updates 🚀</h2>

      <p>Thank you for subscribing to <strong>PrimeCloud</strong>.</p>

      <p>You will now receive important updates, product releases, and insights directly in your inbox.</p>

      <div style="
        margin-top:20px;
        padding:15px;
        background:#f4f6fb;
        border-left:4px solid #ff7a18;
        border-radius:8px;
      ">
        Stay tuned for new features, improvements, and exclusive announcements.
      </div>

      <p style="margin-top:25px;">
      We are excited to keep you informed.
      </p>

      <p style="margin-top:15px;">
      — PrimeCloud Team
      </p>
    `
  });

  // ---------------- EMAIL TO ADMIN ----------------
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'New Subscriber Added',
    html: `
      <h2>New Newsletter Subscriber</h2>

      <p>A new user has subscribed to <strong>PrimeCloud updates</strong>.</p>

      <table style="margin-top:20px;font-size:14px;border-collapse:collapse;">

        <tr>
          <td style="padding:6px 10px;"><strong>Email:</strong></td>
          <td>${email}</td>
        </tr>

        <tr>
          <td style="padding:6px 10px;"><strong>Subscribed At:</strong></td>
          <td>${new Date().toLocaleString()}</td>
        </tr>

      </table>

      <div style="
        margin-top:20px;
        padding:12px;
        background:#f4f6fb;
        border-left:4px solid #ff7a18;
        border-radius:6px;
      ">
        This subscriber will now receive PrimeCloud newsletters and product updates.
      </div>

      <p style="margin-top:20px;">
      — PrimeCloud System Notification
      </p>
    `
  });

  res.status(201).json({ message: 'Subscribed successfully', subscriber: subscription });
});


// ---------------- GET SUBSCRIBER COUNT ----------------
exports.getSubscriberCount = asyncHandler(async (req, res) => {

  const count = await Subscribe.countDocuments();

  res.json({ count });

});
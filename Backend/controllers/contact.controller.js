const Contact = require('../models/contact.model');
const { sendEmail } = require('../services/email.service');

exports.sendContactMessage = async (req, res) => {
  const { firstName, lastName, email, educationOrJobRole, countryCode, phone, message } = req.body;

  try {

    // ---------------- CREATE CONTACT ENTRY ----------------
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      educationOrJobRole,
      countryCode,
      phone,
      message,
    });

    // ---------------- EMAIL TO USER ----------------
    await sendEmail({
      to: email,
      subject: 'We Received Your Message',
      html: `
      <h2 style="margin-bottom:10px;">Hi ${firstName},</h2>

      <p>Thank you for reaching out to <strong>PrimeCloud</strong>.</p>

      <p>Our team has successfully received your message and will review it shortly.</p>

      <p>One of our team members will respond as soon as possible.</p>

      <h3 style="margin-top:25px;">Your Submitted Message</h3>

      <div style="
        background:#f4f6fb;
        padding:15px;
        border-radius:8px;
        border-left:4px solid #ff7a18;
        margin-top:10px;
      ">
        ${message}
      </div>

      <p style="margin-top:25px;">
      If your inquiry is urgent, please allow us a short time to respond.
      </p>

      <p style="margin-top:20px;">
      — PrimeCloud Support Team
      </p>
      `
    });

    // ---------------- EMAIL TO ADMIN ----------------
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: 'New Contact Form Submission',
      html: `
      <h2>New Contact Form Submission</h2>

      <p>A new message has been submitted via the <strong>PrimeCloud Contact Form</strong>.</p>

      <table style="margin-top:20px;font-size:14px;border-collapse:collapse;">

        <tr>
          <td style="padding:6px 10px;"><strong>Name:</strong></td>
          <td>${firstName} ${lastName}</td>
        </tr>

        <tr>
          <td style="padding:6px 10px;"><strong>Email:</strong></td>
          <td>${email}</td>
        </tr>

        <tr>
          <td style="padding:6px 10px;"><strong>Education / Job Role:</strong></td>
          <td>${educationOrJobRole || 'N/A'}</td>
        </tr>

        <tr>
          <td style="padding:6px 10px;"><strong>Phone:</strong></td>
          <td>${countryCode || ''} ${phone || 'N/A'}</td>
        </tr>

        <tr>
          <td style="padding:6px 10px;"><strong>Submitted At:</strong></td>
          <td>${new Date().toLocaleString()}</td>
        </tr>

      </table>

      <h3 style="margin-top:25px;">User Message</h3>

      <div style="
        background:#f4f6fb;
        padding:15px;
        border-radius:8px;
        border-left:4px solid #ff7a18;
        margin-top:10px;
      ">
        ${message}
      </div>

      <p style="margin-top:25px;">
      Please review and respond if necessary.
      </p>

      <p style="margin-top:15px;">
      — PrimeCloud System Notification
      </p>
      `
    });

    res.status(201).json({ message: 'Message sent successfully' });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: 'Server error' });

  }
};
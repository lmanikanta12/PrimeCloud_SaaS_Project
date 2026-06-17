// services/email.service.js
const nodemailer = require("nodemailer");
const logger = require("../config/logger");

// ----------------- Create transporter -----------------

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify((error) => {
  if (error) {
    logger.error("Email configuration error: " + error.message);
  } else {
    logger.info("Email server is ready to send messages");
  }
});

// ----------------- Send Email Function -----------------
/**
 * Send email with custom HTML template
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Custom HTML content
 */

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"PrimeCloud" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${subject}</title>
</head>

<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 10px;">
<tr>
<td align="center">

<!-- EMAIL CONTAINER -->
<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:14px;overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,0.08);">

<!-- HEADER -->
<tr>
<td style="background:linear-gradient(90deg,#ff7a18,#ffb347);padding:28px;text-align:center;">

<h1 style="margin:0;color:white;font-size:26px;font-weight:bold;letter-spacing:1px;">
☁ PrimeCloud
</h1>

<p style="margin:8px 0 0;color:#fff;font-size:13px;opacity:0.9;">
Enterprise Cloud Platform
</p>

</td>
</tr>

<!-- BODY CONTENT -->
<tr>
<td style="padding:35px 40px;color:#333;font-size:15px;line-height:1.7;">

${html}

</td>
</tr>

<!-- DIVIDER -->
<tr>
<td style="padding:0 40px;">
<hr style="border:none;border-top:1px solid #eeeeee;">
</td>
</tr>

<!-- FEATURE STRIP -->
<tr>
<td style="padding:20px 40px;background:#fafafa;text-align:center;font-size:13px;color:#666;">

<table width="100%" style="text-align:center;">
<tr>

<td>
<strong>⚡ Fast</strong><br>
Secure Infrastructure
</td>

<td>
<strong>🔒 Secure</strong><br>
Enterprise Protection
</td>

<td>
<strong>☁ Cloud</strong><br>
Reliable Platform
</td>

</tr>
</table>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="padding:28px 40px;text-align:center;font-size:12px;color:#777;line-height:1.6;">

<p style="margin:0 0 10px;">
You received this email because you interacted with <strong>PrimeCloud</strong>.
</p>

<p style="margin:0 0 10px;">
If you did not request this action, you can safely ignore this email.
</p>

<p style="margin-top:14px;color:#aaa;">
© ${new Date().getFullYear()} PrimeCloud. All rights reserved.
</p>

</td>
</tr>

</table>

<!-- OUTSIDE FOOTER -->
<p style="margin-top:16px;font-size:11px;color:#aaa;text-align:center;">
PrimeCloud • Secure SaaS Infrastructure
</p>

</td>
</tr>
</table>

</body>
</html>
      `,
    });

    logger.info(`Email sent successfully to ${to}`);

  } catch (error) {
    logger.error("Email sending failed: " + error.message);
    throw error;
  }
};

// ----------------- Named Export -----------------
module.exports = { sendEmail };
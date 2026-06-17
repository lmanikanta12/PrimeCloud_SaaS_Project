# PrimeCloud — Backend

A Node.js + Express REST API server for the PrimeCloud SaaS platform. Handles authentication, subscriptions, contact form, payment processing via Razorpay, and email notifications.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB (via Mongoose) |
| Auth | JWT (JSON Web Tokens) |
| Payments | Razorpay |
| Email | Nodemailer (Gmail SMTP) |
| Security | Helmet, CSRF (csurf), express-rate-limit |
| Logging | Winston |
| Validation | express-validator |

---

## Project Structure

```
Backend/
├── config/
│   ├── db.js               # MongoDB connection
│   ├── logger.js           # Winston logger setup
│   └── plans.js            # Pricing plan definitions
├── controllers/
│   ├── auth.controller.js      # Signup, signin, forgot/reset password
│   ├── contact.controller.js   # Contact form submission
│   ├── pricing.controller.js   # Razorpay order, payment verify, free plan
│   └── subscribe.controller.js # Newsletter subscribe, subscriber count
├── errors/
│   └── AppError.js         # Custom error class
├── logs/
│   ├── combined.log
│   └── error.log
├── middleware/
│   ├── asyncHandler.js     # Async error wrapper
│   ├── csrfProtection.js   # CSRF token middleware
│   ├── errorHandler.js     # Global error handler
│   ├── protect.js          # JWT auth guard
│   ├── requestLogger.js    # HTTP request logger
│   ├── security.js         # Helmet + rate limiter
│   └── validate.js         # express-validator result handler
├── models/
│   ├── auth.model.js       # User schema (bcrypt, OTP)
│   ├── contact.model.js    # Contact form schema
│   ├── pricing.model.js    # Purchased plan schema
│   └── subscribe.model.js  # Newsletter subscriber schema
├── routes/
│   ├── index.routes.js     # Root router (mounts all sub-routes)
│   ├── auth.routes.js      # /api/auth/*
│   ├── contact.routes.js   # /api/contact/*
│   ├── health.routes.js    # /api/health
│   ├── pricing.routes.js   # /api/pricing/*
│   └── subscribe.routes.js # /api/subscribe/*
├── services/
│   ├── email.service.js    # Nodemailer transporter + sendEmail()
│   └── razorpay.service.js # Razorpay SDK instance
├── .env                    # Environment variables (do not commit)
├── package.json
└── server.js               # App entry point
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB running locally or a MongoDB Atlas URI
- A Gmail account with an App Password enabled (for Nodemailer)
- Razorpay test account (for payment routes)

### Installation

```bash
cd Backend
npm install
```

### Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/saas_app_premium
JWT_SECRET=your_jwt_secret_here

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

ADMIN_EMAIL=admin@yourdomain.com

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

> **Important:** Never commit your `.env` file. Add it to `.gitignore`.

### Run in Development

```bash
npm run dev
```

### Run in Production

```bash
npm start
```

The server starts on `http://localhost:5000` by default.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/signin` | Login, returns JWT token | No |
| POST | `/forgot-reset` | Send OTP / Reset password | No |

### Contact — `/api/contact`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/` | Submit a contact form message | No |

### Subscribe — `/api/subscribe`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/subscribe` | Subscribe to newsletter | No |
| GET | `/count` | Get total subscriber count | No |

### Pricing — `/api/pricing`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/create-order` | Create a Razorpay payment order | Yes |
| POST | `/verify` | Verify payment + activate plan | Yes |
| POST | `/free` | Activate free plan (no payment) | Yes |
| GET | `/me` | Get current user's active plans | Yes |

### Health — `/api/health`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Server health check |

### CSRF — `/api/csrf-token`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/csrf-token` | Get CSRF token for form submissions |

---

## Available Pricing Plans

| Plan | Price (INR) | Storage |
|---|---|---|
| Free | ₹0 | 1 GB |
| Standard | ₹200 | 10 GB |
| Advanced | ₹500 | 200 GB |
| Premium | ₹700 | 200 GB + AI Analytics |
| Enterprise | ₹1,000 | 500 GB + Custom SLA |

Plan features are defined in `config/plans.js`.

---

## Security Features

- **Helmet** — sets secure HTTP headers
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **CSRF Protection** — via `csurf` on relevant routes
- **JWT Auth** — Bearer token required for protected routes
- **bcryptjs** — passwords hashed with salt rounds of 10
- **OTP-based password reset** — 6-digit OTP, expires in 10 minutes

---

## Email Notifications

All major events trigger emails to both the user and the admin:

- User signup → welcome email
- Contact form submission → confirmation + admin alert
- Newsletter subscription → confirmation + admin alert
- OTP request → OTP email
- Password reset success → confirmation email
- Plan activation (paid & free) → plan details email

Email templates are in `services/email.service.js`.

---

## Notes

- The `logs/` folder is written by Winston. Add it to `.gitignore` or configure log rotation for production.
- CORS is currently set to `origin: true` (all origins). Restrict this to your frontend domain in production.

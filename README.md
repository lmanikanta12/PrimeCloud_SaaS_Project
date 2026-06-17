# PrimeCloud SaaS Project

A full-stack SaaS platform for PrimeCloud — a cloud services brand — featuring a Node.js/Express backend API and a Tailwind-styled static frontend.

## Structure

- [`Backend/`](./Backend/README.md) — Node.js + Express REST API (auth, pricing/payments via Razorpay, contact, newsletter)
- [`Frontend/`](./Frontend/README.md) — Static HTML/Tailwind/JS landing site

See each folder's README for setup instructions, environment variables, and API details.

## Quick Start

```bash
# Backend
cd Backend && npm install && npm run dev

# Frontend
cd Frontend && npm install
# then open page/index.html in a browser
```

> Note: the frontend currently calls `http://localhost:5000` directly for all API requests — make sure the backend is running locally, or update the API host before deploying.

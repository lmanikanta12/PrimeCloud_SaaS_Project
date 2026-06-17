# PrimeCloud — Frontend

A static, multi-section SaaS landing site for PrimeCloud — a fictional cloud platform brand. Built with plain HTML, Tailwind CSS, and vanilla JavaScript. Talks to the [PrimeCloud Backend](../Backend/README.md) for auth, pricing/payments, the contact form, and newsletter subscription.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (single page, `page/index.html`) |
| Styling | Tailwind CSS — loaded via the `cdn.tailwindcss.com` script tag, plus custom CSS in `assets/css/style.css` |
| Scripting | Vanilla JavaScript (`assets/js/main.js`), no framework |
| Icons | Lucide Icons, Font Awesome 6 |
| Fonts | Google Fonts (Poppins) |
| Payments UI | Razorpay Checkout.js |
| Maps | Google Maps Embed (iframe) |
| Build tooling | Tailwind CLI + PostCSS + Autoprefixer — configured but not wired into a build script (see Notes) |

---

## Project Structure

```
Frontend/
├── page/
│   └── index.html          # The entire site — single HTML file, all sections
├── assets/
│   ├── css/
│   │   └── style.css       # @tailwind directives + custom animations/overrides
│   ├── js/
│   │   └── main.js         # All site behavior (auth, pricing, contact form, etc.)
│   └── images/              # Logos, hero backgrounds, blog thumbnails, integration icons
├── .vscode/
│   └── settings.json        # VS Code Live Server port config (5502)
├── tailwind.config.js       # Tailwind content paths + custom font families
├── postcss.config.js        # PostCSS plugins (tailwindcss, autoprefixer)
├── package.json
└── package-lock.json
```

---

## Getting Started

### Option 1 — Open Directly (no build step needed)

Since Tailwind is loaded from the CDN, you can open the page as-is:

```
Frontend/page/index.html  →  open in a browser
```

Or use the VS Code "Live Server" extension (already configured to port `5502` in `.vscode/settings.json`), or any static server: `npx serve .`

### Option 2 — Compile Tailwind locally (optional)

`tailwind.config.js` and `postcss.config.js` are present, but there's no build script in `package.json` yet. To actually generate a compiled CSS file instead of relying on the CDN:

```bash
cd Frontend
npm install
npx tailwindcss -i ./assets/css/style.css -o ./assets/css/output.css --watch
```

Then replace the CDN `<script src="https://cdn.tailwindcss.com">` tag in `index.html` with a `<link>` to `output.css`, and remove the inline `tailwind.config` `<script>` block (move that config into `tailwind.config.js` instead).

> Either way, you'll need the [Backend](../Backend/README.md) running on `http://localhost:5000` for auth, pricing, newsletter, and contact form features to work — the page calls that URL directly (see Notes).

---

## Page Sections (`page/index.html`)

The site is one long scrolling page, in this order, with hash-based sub-navigation for two areas (Blog details and Integrations):

- **Header & Theme Toggle** — sticky nav, dark/light mode switch, auth-aware Sign In/Profile button
- **Auth Modal** — Sign In / Sign Up / Forgot-Reset Password, all in one sliding panel
- **Hero** — background image slider with CTA buttons and a demo video modal
- **Features** — 6 feature highlight cards
- **Services** — 3 core service cards
- **Pricing** — 5 plans (Free, Standard, Advanced, Premium, Enterprise) wired to Razorpay checkout
- **What's Included** — plan comparison details
- **Blog** — searchable blog list with 6 detail views (`detail1`–`detail6`), each gated by plan/login level
- **Testimonials**
- **Integrations** — 9 integration detail pages (Slack, Docker, GitHub, Kubernetes, AWS, Google Cloud, Datadog, Salesforce, Zoom), routed via `#hash`
- **FAQ** — General, Tools, Pricing, Support categories
- **Contact** — form with country-code-aware phone input, posts to the backend
- **Google Maps** — embedded office location
- **About** — stats, mission/values, "why choose us", team
- **Footer** — links, privacy/terms, newsletter signup, download section

---

## JavaScript Behavior (`assets/js/main.js`)

| Feature | What it does |
|---|---|
| Theme toggle | Switches the `dark` class on `<html>`, swaps a sun/moon icon. Not persisted to `localStorage` — resets to light mode on reload. |
| Auth | Sign up / Sign in / Forgot-password (OTP) calling `/api/auth/*`; JWT + user info stored in `localStorage` |
| Plan access control | Fetches the logged-in user's active plans from `/api/pricing/me` and locks/unlocks blog & integration content client-side based on a plan hierarchy (`free → standard → advanced → premium → enterprise`) |
| Pricing & checkout | "Get Started" buttons call `/api/pricing/free` for the free plan, or `/api/pricing/create-order` + Razorpay Checkout + `/api/pricing/verify` for paid plans |
| Newsletter | Subscribe form posts to `/api/subscribe/subscribe`; subscriber count pulled from `/api/subscribe/count` |
| Contact form | Posts to `/api/contact` |
| Blog search | Client-side filter/highlight over blog card titles |
| Integration routing | Hash-based router (`#slack`, `#docker`, etc.) that shows/hides detail sections without a page reload |
| Carousels | Hero background slider and a testimonial/feature card slider with dots and auto-advance |

### Backend endpoints this page depends on

| Endpoint | Used for |
|---|---|
| `POST /api/auth/signup` | Sign up |
| `POST /api/auth/signin` | Sign in |
| `POST /api/auth/forgot-reset` | OTP request + password reset |
| `GET /api/pricing/me` | Load the current user's active plans |
| `POST /api/pricing/free` | Activate free plan |
| `POST /api/pricing/create-order` | Create a Razorpay order |
| `POST /api/pricing/verify` | Verify a Razorpay payment |
| `POST /api/subscribe/subscribe` | Newsletter signup |
| `GET /api/subscribe/count` | Subscriber count display |
| `POST /api/contact` | Contact form submission |

These constants are **not** grouped together at the top of `main.js` — they're declared close to where each feature is used (around lines 446, 522–524, 1049, and 1455), each hardcoded to `http://localhost:5000`.

---

## Notes

- **Hardcoded API host:** every `fetch()` call in `main.js` points to `http://localhost:5000`. Before deploying, replace these with your production API URL — ideally consolidated into a single config constant rather than scattered per-feature strings.
- **Tailwind setup is partially wired up:** the config files and `@tailwind` directives in `style.css` exist, but nothing compiles them — `index.html` loads Tailwind via the CDN script instead, and the browser just ignores the uncompiled `@tailwind` lines in `style.css`, applying only the custom CSS below them (animations, overrides). See "Option 2" above if you want a real production build.
- **Razorpay key:** the Checkout key (`rzp_test_...`) hardcoded in `main.js` is a Razorpay *test* publishable key — safe to expose client-side, but swap it for your live key before going to production.
- **Single HTML file:** the entire site lives in one `index.html` (~5,000 lines). There's no templating or component system, so edits to repeated structures (e.g. the 9 integration detail sections) need to be made by hand in each one.
- **Images** live in `assets/images/` and are referenced with relative paths like `../assets/images/logo.png` from `page/index.html`. If you move `index.html` out of `page/`, update those paths.
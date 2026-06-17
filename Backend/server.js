require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const logger = require("./config/logger");

const routes = require("./routes/index.routes");
const errorHandler = require("./middleware/errorHandler");
const securityMiddleware = require("./middleware/security");
const requestLogger = require("./middleware/requestLogger");
const csrfProtection = require("./middleware/csrfProtection");

const app = express();

// ---------------- CORS ----------------
app.use(cors({
  origin: true,       // Allow all origins, can be restricted
  credentials: true,  // Allow cookies
}));

// ---------------- BODY PARSERS ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------- REQUEST LOGGER ----------------
app.use(requestLogger);

// ---------------- SECURITY MIDDLEWARE ----------------
securityMiddleware(app);

// ---------------- ENV VALIDATION ----------------
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  logger.error("❌ Missing required environment variables.");
  process.exit(1);
}

// ---------------- DATABASE CONNECTIONS ----------------
connectDB();                // MongoDB


// ---------------- CSRF ----------------
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ---------------- ROUTES ----------------
app.use("/api", routes); // index.routes.js includes contact, subscribe, auth, health

// ---------------- ERROR HANDLER ----------------
app.use(errorHandler);

// ---------------- MONITORING UNHANDLED ERRORS ----------------
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection: " + err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: " + err.message);
  process.exit(1);
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// ---------------- GRACEFUL SHUTDOWN ----------------
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Process terminated.");
  });
});
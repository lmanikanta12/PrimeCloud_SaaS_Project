const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const security = (app) => {
  app.use(helmet());
  app.use(cors());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 100,
      message: 'Too many requests from this IP, try again later',
    })
  );
};

module.exports = security;
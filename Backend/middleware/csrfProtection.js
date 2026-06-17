const csurf = require('csurf');

const csrfProtection = csurf({
  cookie: true, // secure cookies if needed
});

module.exports = csrfProtection;
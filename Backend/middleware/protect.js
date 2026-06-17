const jwt = require('jsonwebtoken');
const User = require('../models/auth.model');
const AppError = require('../errors/AppError');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, token missing', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('User not found', 404));

    req.user = user;
    next();
  } catch (err) {
    next(new AppError('Not authorized, token invalid', 401));
  }
};

module.exports = protect;
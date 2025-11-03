const AppError = require('../utils/appError');

// Handle Sequelize specific errors
const handleSequelizeError = (err) => {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => e.message).join(', ');
    return new AppError(`Database validation error: ${message}`, 400);
  }
  return err;
};

// Handle Firebase token errors
const handleFirebaseError = (err) => {
  if (err.code && err.code.startsWith('auth/')) {
    return new AppError('Invalid or expired Firebase token', 401);
  }
  return err;
};

const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 1️⃣ Handle known libraries' errors
  if (err.name?.startsWith('Sequelize')) error = handleSequelizeError(err);
  if (err.code?.startsWith('auth/')) error = handleFirebaseError(err);

  // 2️⃣ Handle unexpected errors
  if (!error.isOperational) {
    console.error('💥 UNEXPECTED ERROR:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // 3️⃣ Send error response
  return res.status(error.statusCode || 500).json({
    status: error.status || 'error',
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;

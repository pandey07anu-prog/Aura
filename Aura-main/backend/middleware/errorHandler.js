class AppError extends Error {
  constructor(message, statusCode, errorType = null, fieldErrors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.fieldErrors = fieldErrors;
  }
}

class BadRequestError extends AppError {
  constructor(message, fieldErrors = null) {
    super(message, 400, 'Bad Request', fieldErrors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'Unauthorized');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403, 'Forbidden');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'Not Found');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'Conflict');
  }
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || err.status || 500;
  let errorName = err.errorType || 'Internal Server Error';
  let message = err.message || 'An unexpected error occurred';
  let fieldErrors = err.fieldErrors || null;

  if (err.name === 'ValidationError') {
    status = 400;
    errorName = 'Validation Error';
    message = 'Input validation failed. Please check the provided fields.';
    fieldErrors = {};
    for (const key in err.errors) {
      fieldErrors[key] = err.errors[key].message;
    }
  } else if (err.code === 11000) {
    status = 409;
    errorName = 'Conflict';
    message = 'A record with this unique identifier already exists';
  } else if (err.name === 'CastError') {
    status = 400;
    errorName = 'Bad Request';
    message = `Invalid format for field '${err.path}'`;
  }

  if (status === 400 && !errorName) errorName = 'Bad Request';
  if (status === 401 && !errorName) errorName = 'Unauthorized';
  if (status === 403 && !errorName) errorName = 'Forbidden';
  if (status === 404 && !errorName) errorName = 'Not Found';
  if (status === 409 && !errorName) errorName = 'Conflict';

  const responseBody = {
    success: false,
    status,
    error: errorName,
    message,
    timestamp: new Date().toISOString()
  };

  if (fieldErrors) {
    responseBody.fieldErrors = fieldErrors;
  }

  res.status(status).json(responseBody);
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  errorHandler
};

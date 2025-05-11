class AppError extends Error {
  constructor(message = "An error occurred", statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capturing the stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

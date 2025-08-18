class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log the error for debugging
  console.error(err);
  if (err.name === "jsonwebtokenError") {
    err.statusCode = 401;
    err.message = "Json Web Token is invalid. Try again later";
  }
  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = "Json Web Token is expired. Try again later";
  }
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.message = `Resource not found. Invalid: ${err.path}`;
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
  const errorMessage = err.error
    ? Object.values(err.error)
        .map((value) => value.message)
        .join(",   ")
    : err.message;
};
export default ErrorHandler;

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: error.message || "Internal server error.",
      details: error.details || null,
      requestId: req.requestId,
    },
  });
}

export function corsErrorHandler(error, _req, res, next) {
  if (!error || error.message !== "Origin is not allowed by CORS.") {
    return next(error);
  }

  return res.status(403).json({
    error: {
      message: "Origin is not allowed by CORS.",
      details: null,
      requestId: null,
    },
  });
}

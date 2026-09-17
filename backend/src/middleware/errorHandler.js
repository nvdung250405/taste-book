import logger from "../config/logger";

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled application error", {
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      EC: -1,
      EM: "CORS policy blocked this request.",
      DT: null,
    });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      EC: -1,
      EM: "File size is too large.",
      DT: null,
    });
  }

  return res.status(500).json({
    EC: -1,
    EM: "Internal server error.",
    DT: null,
  });
};

export default errorHandler;
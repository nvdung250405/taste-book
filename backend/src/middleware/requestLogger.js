import { randomUUID } from "crypto";
import logger from "../config/logger";

const requestLogger = (req, res, next) => {
  const requestId = randomUUID();

  req.requestId = requestId;

  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 500) {
      logger.error("HTTP request failed", logData);
    } else if (res.statusCode >= 400) {
      logger.warn("HTTP request warning", logData);
    } else {
      logger.info("HTTP request", logData);
    }
  });

  next();
};

export default requestLogger;
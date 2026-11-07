import { rateLimit } from "express-rate-limit";

// A separate request property preserves metadata from each limiter layer.
const createRateLimiter = (policy, windowMs, limit, message, options = {}) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  requestPropertyName: `rateLimit_${policy}`,
  ...options,
  handler: (req, res, next, settings) => {
    const state = req[`rateLimit_${policy}`];
    req.rateLimitViolation = {
      policy,
      limit: state.limit,
      used: state.used,
      windowMs,
      resetTime: state.resetTime,
    };
    res.set("X-RateLimit-Policy", policy);
    return res.status(settings.statusCode).json({ EC: 7, EM: message, DT: null });
  },
});

export default createRateLimiter;

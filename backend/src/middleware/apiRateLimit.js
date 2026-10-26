import createRateLimiter from "./createRateLimiter";

// MemoryStore is per process and resets on restart; see docs before scaling.
export const createApiLimiter = () => createRateLimiter(
  "api",
  15 * 60 * 1000,
  100,
  "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại theo thời gian trong Retry-After.",
  { skip: (req) => req.method === "OPTIONS" },
);

export const apiLimiter = createApiLimiter();

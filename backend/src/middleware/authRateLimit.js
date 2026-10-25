import { rateLimit } from "express-rate-limit";

const createLimiter = (windowMs, limit, message, options = {}) => rateLimit({
  windowMs,
  limit,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { EC: 7, EM: message, DT: null },
  ...options,
});

// Mỗi limiter có bộ đếm riêng trong bộ nhớ của tiến trình.
// Khi chạy nhiều instance, cần thay bằng store dùng chung.
export const loginLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  "Bạn đã đăng nhập không thành công quá nhiều lần. Vui lòng thử lại sau 15 phút!",
  { skipSuccessfulRequests: true },
);

export const registerLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ!",
);

// Chỉ gắn sau checkUserJWT: danh tính lấy từ người dùng đã được xác thực.
export const passwordChangeLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  "Bạn đã gửi quá nhiều yêu cầu đổi mật khẩu. Vui lòng thử lại sau 15 phút!",
  { keyGenerator: (req) => String(req.user.userId) },
);

import createRateLimiter from "./createRateLimiter";

// Mỗi limiter có bộ đếm riêng trong bộ nhớ của tiến trình.
// Khi chạy nhiều instance, cần thay bằng store dùng chung.
export const loginLimiter = createRateLimiter(
  "login",
  15 * 60 * 1000,
  10,
  "Bạn đã đăng nhập không thành công quá nhiều lần. Vui lòng thử lại sau 15 phút!",
  { skipSuccessfulRequests: true },
);

export const registerLimiter = createRateLimiter(
  "register",
  60 * 60 * 1000,
  5,
  "Bạn đã gửi quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 giờ!",
);

// Chỉ gắn sau checkUserJWT: danh tính lấy từ người dùng đã được xác thực.
export const passwordChangeLimiter = createRateLimiter(
  "passwordChange",
  15 * 60 * 1000,
  5,
  "Bạn đã gửi quá nhiều yêu cầu đổi mật khẩu. Vui lòng thử lại sau 15 phút!",
  { keyGenerator: (req) => String(req.user.userId) },
);

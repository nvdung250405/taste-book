import authService from "../../src/services/authService";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";

describe("AuthService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerNewUser", () => {
    test("thành công: đăng ký người dùng mới với thông tin hợp lệ (EC: 0)", async () => {
      const userData = {
        username: "nguyenvana",
        email: "nguyenvana@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(null);
      jest.spyOn(db.User, "create").mockResolvedValue({
        id: 1,
        username: "nguyenvana",
        email: "nguyenvana@example.com",
      });

      const res = await authService.registerNewUser(userData);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toBeDefined();
      expect(res.DT.userId).toBe(1);
      expect(res.DT.email).toBe("nguyenvana@example.com");
    });

    test("thất bại: thiếu trường bắt buộc (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("đầy đủ các thông tin bắt buộc");
    });

    test("thất bại: email không đúng định dạng (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "invalid-email-format",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Địa chỉ Email không đúng định dạng");
    });

    test("thất bại: số điện thoại không hợp lệ (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "12345",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Số điện thoại không đúng định dạng");
    });

    test("thất bại: mật khẩu ngắn hơn 6 ký tự (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("từ 6 ký tự trở lên");
    });

    test("thất bại: mật khẩu xác nhận không trùng khớp (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không trùng khớp");
    });

    test("thất bại: email đã tồn tại trên hệ thống (EC: 2)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValueOnce({ id: 1, email: "exist@example.com" });

      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "exist@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(2);
      expect(res.EM).toContain("đã được đăng ký");
    });
  });

  describe("handleUserLogin", () => {
    test("thành công: đăng nhập đúng email và mật khẩu (EC: 0)", async () => {
      const mockUser = {
        id: 1,
        username: "nguyenvana",
        email: "user@example.com",
        password: bcrypt.hashSync("password123", 10),
        status: "Active",
        role: "User",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await authService.handleUserLogin({
        valueLogin: "user@example.com",
        password: "password123",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toHaveProperty("accessToken");
      expect(res.DT.user.email).toBe("user@example.com");
    });

    test("thất bại: để trống thông tin đăng nhập (EC: 1)", async () => {
      const res = await authService.handleUserLogin({
        valueLogin: "",
        password: "",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Vui lòng nhập tài khoản và mật khẩu");
    });

    test("thất bại: tài khoản không tồn tại (EC: 6)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);

      const res = await authService.handleUserLogin({
        valueLogin: "notfound@example.com",
        password: "password123",
      });

      expect(res.EC).toBe(6);
      expect(res.EM).toContain("không chính xác");
    });

    test("thất bại: mật khẩu không chính xác (EC: 6)", async () => {
      const mockUser = {
        id: 1,
        email: "user@example.com",
        password: bcrypt.hashSync("correctpassword", 10),
        status: "Active",
        role: "User",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await authService.handleUserLogin({
        valueLogin: "user@example.com",
        password: "wrongpassword",
      });

      expect(res.EC).toBe(6);
      expect(res.EM).toContain("không chính xác");
    });
  });

  describe("handleUserLogout", () => {
    test("thành công: đăng xuất tài khoản trả về EC: 0", () => {
      const res = authService.handleUserLogout();
      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toBeNull();
    });
  });
});

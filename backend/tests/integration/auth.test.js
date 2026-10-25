import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import { ipKeyGenerator } from "express-rate-limit";
import authService from "../../src/services/authService";
import userService from "../../src/services/userService";
import { loginLimiter, registerLimiter, passwordChangeLimiter } from "../../src/middleware/authRateLimit";

describe("Auth & Core API Integration Tests (Supertest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: "User",
    });
  });

  describe("404 Endpoint Not Found Handler", () => {
    test("trả về 404 và format chuẩn khi gọi route không tồn tại", async () => {
      const res = await request(app).get("/api/v1/this-route-does-not-exist");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        EC: 3,
        EM: "API endpoint not found.",
        DT: null,
      });
    });
  });

  describe("Authentication & Authorization Middleware Guards", () => {
    test("POST /api/v1/recipes - chặn 401 khi không gửi kèm token JWT", async () => {
      const res = await request(app)
        .post("/api/v1/recipes")
        .send({ title: "Công thức mới" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("GET /api/v1/recipes/mine - chặn 401 khi không có token", async () => {
      const res = await request(app).get("/api/v1/recipes/mine");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("GET /api/v1/users/me - chặn 401 khi không có token", async () => {
      const res = await request(app).get("/api/v1/users/me");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("chặn 401 khi gửi token giả mạo hoặc sai định dạng", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer invalid_token_12345");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });
  });

  describe("Auth Endpoints Validation", () => {
    test("POST /api/v1/auth/register - trả về 400 khi body rỗng", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Vui lòng nhập đầy đủ các thông tin bắt buộc!");
    });

    test("POST /api/v1/auth/login - trả về 400 khi để trống thông tin", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Vui lòng nhập tài khoản và mật khẩu!");
    });

    test("POST /api/v1/auth/logout - chặn 401 khi không có token", async () => {
      const res = await request(app).post("/api/v1/auth/logout");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("POST /api/v1/auth/logout - đăng xuất thành công 200 khi có token hợp lệ", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
    });
  });
});

describe("Authentication rate limiting (#74)", () => {
  const login = () => request(app).post("/api/v1/auth/login").send({ valueLogin: "user@example.com", password: "wrongpassword" });
  const register = () => request(app).post("/api/v1/auth/register").send({});
  const changePassword = (userId = 1) => request(app)
    .put("/api/v1/users/me/password")
    .set("Authorization", `Bearer ${createJWT({ userId, role: "User" })}`)
    .send({ oldPassword: "wrongpassword", newPassword: "newpassword", confirmNewPassword: "newpassword" });

  beforeEach(async () => {
    // Reset bộ đếm thật để test độc lập; không tắt limiter trong NODE_ENV=test.
    for (const limiter of [loginLimiter, registerLimiter]) {
      for (const ip of ["127.0.0.1", "::ffff:127.0.0.1", "::1"]) {
        await limiter.resetKey(ipKeyGenerator(ip));
      }
    }
    for (const userId of [1, 2]) await passwordChangeLimiter.resetKey(String(userId));
    jest.spyOn(db.User, "findOne").mockImplementation(async ({ where }) => ({ id: where.id, role: "User" }));
    jest.spyOn(authService, "handleUserLogin").mockResolvedValue({ EC: 6, EM: "Sai mật khẩu!", DT: null });
    jest.spyOn(authService, "registerNewUser").mockResolvedValue({ EC: 0, EM: "Thành công!", DT: {} });
    jest.spyOn(userService, "changeUserPassword").mockResolvedValue({ EC: 6, EM: "Sai mật khẩu!", DT: null });
  });

  const expectBlocked = (response) => {
    expect(response.status).toBe(429);
    expect(response.body).toMatchObject({ EC: 7, DT: null });
    expect(response.body.EM).toEqual(expect.any(String));
    expect(Number(response.headers["retry-after"])).toBeGreaterThan(0);
    expect(response.headers.ratelimit).toBeDefined();
  };

  test("login: 10 lần sai được xử lý, lần 11 bị chặn trước service", async () => {
    for (let i = 0; i < 10; i++) expect((await login()).status).toBe(401);
    expectBlocked(await login());
    expect(authService.handleUserLogin).toHaveBeenCalledTimes(10);
  });

  test("login thành công không làm cạn hạn mức", async () => {
    authService.handleUserLogin.mockResolvedValue({ EC: 0, EM: "Thành công!", DT: {} });
    for (let i = 0; i < 12; i++) expect((await login()).status).toBe(200);
    authService.handleUserLogin.mockResolvedValue({ EC: 6, EM: "Sai mật khẩu!", DT: null });
    for (let i = 0; i < 10; i++) expect((await login()).status).toBe(401);
    expectBlocked(await login());
  });

  test("hết 15 phút thì login được xử lý lại", async () => {
    for (let i = 0; i < 10; i++) await login();
    expectBlocked(await login());
    const afterWindow = Date.now() + 15 * 60 * 1000 + 1000;
    jest.spyOn(Date, "now").mockReturnValue(afterWindow);
    expect((await login()).status).toBe(401);
    expect(authService.handleUserLogin).toHaveBeenCalledTimes(11);
  });

  test("register: lần thứ 6 bị chặn, bộ đếm không ảnh hưởng login", async () => {
    for (let i = 0; i < 5; i++) expect((await register()).status).toBe(201);
    expectBlocked(await register());
    expect(authService.registerNewUser).toHaveBeenCalledTimes(5);
    expect((await login()).status).toBe(401);
    const afterWindow = Date.now() + 60 * 60 * 1000 + 1000;
    jest.spyOn(Date, "now").mockReturnValue(afterWindow);
    expect((await register()).status).toBe(201);
  });

  test("đổi mật khẩu: hạn mức theo tài khoản, hết thời gian được thử lại", async () => {
    for (let i = 0; i < 5; i++) expect((await changePassword()).status).toBe(401);
    expectBlocked(await changePassword());
    expect(userService.changeUserPassword).toHaveBeenCalledTimes(5);
    expect((await changePassword(2)).status).toBe(401);
    const afterWindow = Date.now() + 15 * 60 * 1000 + 1000;
    jest.spyOn(Date, "now").mockReturnValue(afterWindow);
    expect((await changePassword()).status).toBe(401);
  });

  test("đổi mật khẩu chưa đăng nhập trả 401, không tính vào hạn mức tài khoản", async () => {
    for (let i = 0; i < 6; i++) {
      const response = await request(app).put("/api/v1/users/me/password").send({});
      expect(response.status).toBe(401);
      expect(response.body.EC).toBe(5);
    }
    expect(userService.changeUserPassword).not.toHaveBeenCalled();
    expect((await changePassword()).status).toBe(401);
    expect(userService.changeUserPassword).toHaveBeenCalledTimes(1);
  });

  test("giả X-Forwarded-For không vượt được hạn mức khi không tin cậy proxy", async () => {
    for (let i = 0; i < 10; i++) await login();
    const response = await request(app)
      .post("/api/v1/auth/login")
      .set("X-Forwarded-For", "203.0.113.42")
      .send({});
    expectBlocked(response);
    expect(authService.handleUserLogin).toHaveBeenCalledTimes(10);
  });

  test("IP khác có bộ đếm độc lập", async () => {
    // App test riêng với địa chỉ socket khác, dùng chính limiter production.
    const express = require("express");
    const isolatedApp = express();
    isolatedApp.use((req, res, next) => {
      Object.defineProperty(req, "ip", { value: req.headers["x-test-ip"] });
      next();
    });
    isolatedApp.post("/login", loginLimiter, (req, res) => res.sendStatus(401));
    for (let i = 0; i < 10; i++) {
      await request(isolatedApp).post("/login").set("X-Test-IP", "192.0.2.10");
    }
    expectBlocked(await request(isolatedApp).post("/login").set("X-Test-IP", "192.0.2.10"));
    expect((await request(isolatedApp).post("/login").set("X-Test-IP", "192.0.2.11")).status).toBe(401);
    await loginLimiter.resetKey(ipKeyGenerator("192.0.2.10"));
    await loginLimiter.resetKey(ipKeyGenerator("192.0.2.11"));
  });
});

import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

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
        EC: -1,
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

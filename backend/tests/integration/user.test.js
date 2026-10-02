import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";

describe("User API Integration Tests (Supertest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: "User",
    });
  });

  describe("GET /api/v1/users/me (UC-05: Lấy thông tin cá nhân)", () => {
    test("chặn 401 khi không gửi kèm token JWT", async () => {
      const res = await request(app).get("/api/v1/users/me");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("chặn 401 khi gửi token giả mạo hoặc sai định dạng", async () => {
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer invalid_token_12345");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("trả về 200 và thông tin cá nhân khi có token hợp lệ", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        phone: "0912345678",
        avatarUrl: "https://cloudinary.com/avatar.jpg",
        role: "User",
        createdAt: "2026-09-01T00:00:00.000Z",
      };
      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
      expect(res.body.DT.userId).toBe(1);
      expect(res.body.DT.username).toBe("testuser");
    });
  });

  describe("PUT /api/v1/users/me (UC-05: Cập nhật hồ sơ cá nhân)", () => {
    test("chặn 401 khi không gửi kèm token JWT", async () => {
      const res = await request(app)
        .put("/api/v1/users/me")
        .send({ username: "new_name" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 400 khi tên hiển thị rỗng", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "   " });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("không được để trống");
    });

    test("trả về 200 khi cập nhật hồ sơ thành công", async () => {
      const mockUser = {
        id: 1,
        username: "old_name",
        phone: "0911111111",
        avatarUrl: "avatar.jpg",
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.User, "findOne").mockImplementation(({ where }) => {
        if (where && where.phone) return Promise.resolve(null);
        return Promise.resolve(mockUser);
      });

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "new_name", phone: "0988888888" });

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
    });
  });

  describe("PUT /api/v1/users/me/password (UC-05: Đổi mật khẩu)", () => {
    test("chặn 401 khi không gửi kèm token JWT", async () => {
      const res = await request(app)
        .put("/api/v1/users/me/password")
        .send({ oldPassword: "123", newPassword: "456" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 400 khi thiếu thông tin mật khẩu", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ oldPassword: "", newPassword: "" });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("Vui lòng nhập đầy đủ");
    });

    test("trả về 200 khi đổi mật khẩu thành công", async () => {
      const oldPasswordHash = bcrypt.hashSync("correctPass123", 10);
      const mockUser = {
        id: 1,
        password: oldPasswordHash,
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          oldPassword: "correctPass123",
          newPassword: "newSecurePass123",
          confirmNewPassword: "newSecurePass123",
        });

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
    });
  });
});

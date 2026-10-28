import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";
import { cloudinary } from "../../src/config/cloudinary";

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
    test.each([
      "http://169.254.169.254/latest/meta-data/",
      "https://res.cloudinary.com.evil.test/demo/image/upload/avatar.png",
      "https://res.cloudinary.com/other-cloud/image/upload/avatar.png",
    ])("từ chối avatar không tin cậy qua API: %s (#70)", async (avatarUrl) => {
      jest.replaceProperty(process, "env", { ...process.env, CLOUDINARY_CLOUD_NAME: "demo" });
      const user = { id: 1, role: "User", update: jest.fn() };
      db.User.findOne.mockResolvedValue(user);
      const resource = jest.spyOn(cloudinary.api, "resource").mockResolvedValue({ bytes: 1024 });
      const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Unexpected fetch"));
      const token = createJWT({ userId: 1, role: "User" });

      const res = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "user", avatarUrl });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(user.update).not.toHaveBeenCalled();
      expect(resource).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    test("chấp nhận avatar Cloudinary hợp lệ qua API (#70)", async () => {
      jest.replaceProperty(process, "env", { ...process.env, CLOUDINARY_CLOUD_NAME: "demo" });
      const avatarUrl = "https://res.cloudinary.com/demo/image/upload/v123/tastebook_uploads/avatar.png";
      const user = { id: 1, role: "User", update: jest.fn().mockImplementation(async (data) => Object.assign(user, data)) };
      db.User.findOne.mockResolvedValue(user);
      const resource = jest.spyOn(cloudinary.api, "resource").mockResolvedValue({ bytes: 1024 });
      const fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Unexpected fetch"));
      const token = createJWT({ userId: 1, role: "User" });

      const res = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: "user", avatarUrl });

      expect(res.status).toBe(200);
      expect(res.body.DT.avatarUrl).toBe(avatarUrl);
      expect(resource).toHaveBeenCalledWith("tastebook_uploads/avatar");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

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


describe("UC-24 admin user API (mocked database)", () => {
  let findUser;
  let listUsers;
  let adminToken;
  const admin = { id: 1, username: "Admin", role: "Admin" };
  const user = { id: 2, username: "Lan", email: "lan@example.com", phone: "0912345678", role: "User", password: "secret-hash" };

  beforeEach(() => {
    findUser = jest.spyOn(db.User, "findOne").mockResolvedValue(admin);
    listUsers = jest.spyOn(db.User, "findAndCountAll").mockResolvedValue({ rows: [user], count: 11 });
    adminToken = createJWT({ userId: 1, role: "Admin" });
  });

  describe.each(["/api/v1/admin/users", "/api/v1/admin/users/2"])("authorization for %s", (url) => {
    test("missing bearer token returns 401", async () => {
      const res = await request(app).get(url);
      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(findUser).not.toHaveBeenCalled();
      expect(listUsers).not.toHaveBeenCalled();
    });

    test.each(["invalid", "expired", "wrong-signature"])("%s token returns 401", async (kind) => {
      const token = kind === "invalid" ? "invalid-token" : jwt.sign(
        { userId: 1, role: "Admin" },
        kind === "wrong-signature" ? "different-signing-key" : process.env.JWT_SECRET,
        { expiresIn: kind === "expired" ? -1 : "1h" },
      );
      const res = await request(app).get(url).set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(listUsers).not.toHaveBeenCalled();
    });

    test("token with User role returns 403 before accessing managed accounts", async () => {
      findUser.mockResolvedValue(user);
      const token = createJWT({ userId: user.id, role: "User" });
      const res = await request(app).get(url).set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ EC: 4, DT: null });
      expect(findUser).toHaveBeenCalledTimes(1);
      expect(findUser).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(listUsers).not.toHaveBeenCalled();
    });

    test("user role in DB overrides Admin claim in JWT", async () => {
      findUser.mockResolvedValue({ ...admin, role: "User" });
      const res = await request(app).get(url).set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(403);
      expect(res.body.EC).toBe(4);
      expect(findUser).toHaveBeenCalledTimes(1);
      expect(listUsers).not.toHaveBeenCalled();
    });

    test("deleted token owner returns 401", async () => {
      findUser.mockResolvedValue(null);
      const res = await request(app).get(url).set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(401);
      expect(listUsers).not.toHaveBeenCalled();
    });
  });

  test("Admin gets search results and pagination without password", async () => {
    const res = await request(app).get("/api/v1/admin/users?keyword=Lan&role=User&page=2&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.DT).toMatchObject({ page: 2, limit: 10, total: 11, totalPages: 2 });
    expect(res.body.DT.users[0]).toMatchObject({ userId: 2, username: "Lan" });
    expect(res.body.DT.users[0]).not.toHaveProperty("password");
    expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ offset: 10, limit: 10 }));
  });

  test.each(["page=0", "limit=101", "keyword[x]=Lan", "role=Unknown", "role=Admin&role=User", "page=1&page=2"])("invalid query %s returns 400", async (query) => {
    const res = await request(app).get(`/api/v1/admin/users?${query}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.EC).toBe(1);
    expect(listUsers).not.toHaveBeenCalled();
  });

  test("page beyond results returns 200 with empty list", async () => {
    listUsers.mockResolvedValue({ rows: [], count: 11 });
    const res = await request(app).get("/api/v1/admin/users?page=3&limit=10").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.DT).toEqual({ users: [], page: 3, limit: 10, total: 11, totalPages: 2 });
  });

  test("Admin gets user detail without password", async () => {
    findUser.mockResolvedValueOnce(admin).mockResolvedValueOnce(user);
    const res = await request(app).get("/api/v1/admin/users/2").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.DT).toEqual({ userId: 2, username: "Lan", email: user.email, phone: user.phone, role: "User" });
  });

  test("missing user returns 404", async () => {
    findUser.mockResolvedValueOnce(admin).mockResolvedValueOnce(null);
    const res = await request(app).get("/api/v1/admin/users/999").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(res.body.EC).toBe(3);
  });

  test("malformed user ID is not interpreted as another account", async () => {
    const res = await request(app).get("/api/v1/admin/users/2abc").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
    expect(findUser).toHaveBeenCalledTimes(1);
  });

  test("DB failure returns 500 without internal error details", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    listUsers.mockRejectedValue(new Error("private database information"));
    const res = await request(app).get("/api/v1/admin/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
  });
});

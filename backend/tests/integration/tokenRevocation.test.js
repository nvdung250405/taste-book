import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import app from "../../src/server";
import db from "../../src/models/index";
import { createJWT, verifyToken } from "../../src/middleware/JWTAction";

describe("#128: thu hồi JWT khi đăng xuất", () => {
  let storedTokens;
  const user = { id: 10, username: "Author", email: "author@example.com", role: "User",
    password: bcrypt.hashSync("password123", 4) };
  const auth = token => ({ Authorization: `Bearer ${token}` });
  const profile = token => request(app).get("/api/v1/users/me").set(auth(token));
  const logout = token => request(app).post("/api/v1/auth/logout").set(auth(token));
  const login = () => request(app).post("/api/v1/auth/login")
    .send({ valueLogin: user.email, password: "password123" });

  beforeEach(() => {
    storedTokens = new Map();
    jest.spyOn(db.User, "findOne").mockResolvedValue(user);
    db.RevokedToken.findByPk.mockImplementation(async key => storedTokens.get(key) || null);
    jest.spyOn(db.RevokedToken, "findOrCreate").mockImplementation(async ({ where, defaults }) => {
      const created = !storedTokens.has(where.tokenHash);
      if (created) storedTokens.set(where.tokenHash, { ...where, ...defaults });
      return [storedTokens.get(where.tokenHash), created];
    });
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
      id: 105, authorId: user.id, title: "Private", isPublic: false, approvalStatus: "Approved",
    });
  });

  test("login A/B độc lập; logout A thu hồi mọi bản sao, vẫn dùng B và đăng nhập C được", async () => {
    const first = await login();
    const second = await login();
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const tokenA = first.body.DT.accessToken;
    const tokenB = second.body.DT.accessToken;
    expect(verifyToken(tokenA).jti).not.toBe(verifyToken(tokenB).jti);
    expect((await profile(tokenA)).status).toBe(200);
    const copiedToken = `${tokenA}`;
    const response = await logout(tokenA);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ EC: 0, DT: null });
    expect(storedTokens.size).toBe(1);
    const hash = createHash("sha256").update(tokenA).digest("hex");
    expect(storedTokens.get(hash)).toEqual({
      tokenHash: hash, jti: verifyToken(tokenA).jti, userId: user.id,
      expiresAt: new Date(verifyToken(tokenA).exp * 1000),
    });
    expect(JSON.stringify([...storedTokens.values()])).not.toContain(tokenA);
    for (const token of [tokenA, copiedToken]) {
      const revoked = await profile(token);
      expect(revoked.status).toBe(401);
      expect(revoked.body).toMatchObject({ EC: 5, DT: null });
    }
    expect((await logout(tokenA)).status).toBe(401);
    expect((await profile(tokenB)).status).toBe(200);
    const third = await login();
    expect(third.status).toBe(200);
    expect((await profile(third.body.DT.accessToken)).status).toBe(200);
  });

  test("optional: token đã thu hồi không xem được bài riêng, vẫn xem được bài công khai", async () => {
    const token = createJWT({ userId: user.id, role: "User" });
    const detail = () => request(app).get("/api/v1/recipes/105").set(auth(token));
    expect((await detail()).status).toBe(200);
    expect((await logout(token)).status).toBe(200);
    expect((await detail()).status).toBe(404);
    db.Recipe.findOne.mockResolvedValue({ id: 105, authorId: user.id, isPublic: true, approvalStatus: "Approved" });
    expect((await detail()).status).toBe(200);
  });

  test("thu hồi được JWT cũ không có jti", async () => {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    expect((await logout(token)).status).toBe(200);
    expect([...storedTokens.values()][0].jti).toBeNull();
    expect((await profile(token)).status).toBe(401);
  });

  test("không báo logout thành công khi lưu DB thất bại", async () => {
    db.RevokedToken.findOrCreate.mockRejectedValue(new Error("Revocation write failed"));
    const token = createJWT({ userId: user.id });
    const response = await logout(token);
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ EC: -1, DT: null });
    expect(storedTokens.size).toBe(0);
    expect((await profile(token)).status).toBe(200);
  });

  test("lỗi tra cứu DB: API bắt buộc trả 500; optional không cấp quyền tác giả", async () => {
    db.RevokedToken.findByPk.mockRejectedValue(new Error("Revocation store unavailable"));
    const token = createJWT({ userId: user.id });
    expect((await profile(token)).status).toBe(500);
    expect((await request(app).get("/api/v1/recipes/105").set(auth(token))).status).toBe(404);
  });

  test.each(["invalid-token", "expired", "tampered"])("không ghi DB với token %s", async kind => {
    const token = kind === "expired"
      ? jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: -1 })
      : kind === "tampered" ? jwt.sign({ userId: user.id }, "wrong-secret") : kind;
    expect((await logout(token)).status).toBe(401);
    expect(db.RevokedToken.findOrCreate).not.toHaveBeenCalled();
  });
});

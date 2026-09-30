import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

describe("Category API Integration Tests (UC-25)", () => {
  const userToken = createJWT({ userId: 10, email: "user10@example.com", role: "User" });
  const otherUserToken = createJWT({ userId: 99, email: "user99@example.com", role: "User" });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 10,
      email: "user10@example.com",
      username: "user10",
      role: "User",
    });
  });

  describe("GET /api/v1/categories (UC-06 / UC-08: Lấy danh sách danh mục)", () => {
    test("thành công: khách vãng lai chưa đăng nhập vẫn lấy được danh mục hệ thống (200, EC: 0)", async () => {
      const mockCategories = [
        { id: 1, categoryName: "Món xào", createdBy: null },
        { id: 2, categoryName: "Món kho", createdBy: null },
      ];
      jest.spyOn(db.Category, "findAll").mockResolvedValue(mockCategories);

      const res = await request(app).get("/api/v1/categories");

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
      expect(res.body.DT).toHaveLength(2);
    });

    test("thành công: người dùng đã đăng nhập lấy danh mục hệ thống và danh mục cá nhân (200, EC: 0)", async () => {
      const mockCategories = [
        { id: 1, categoryName: "Món xào", createdBy: null },
        { id: 10, categoryName: "Món ăn kiêng của tôi", createdBy: 10 },
      ];
      jest.spyOn(db.Category, "findAll").mockResolvedValue(mockCategories);

      const res = await request(app)
        .get("/api/v1/categories")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.DT).toHaveLength(2);
      expect(res.body.DT[1].categoryId).toBe(10);
    });
  });

  describe("POST /api/v1/categories (UC-25: Tạo danh mục cá nhân)", () => {
    test("chặn 401 khi không có token JWT", async () => {
      const res = await request(app)
        .post("/api/v1/categories")
        .send({ categoryName: "Món Chay" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("báo lỗi 400 khi tên danh mục rỗng", async () => {
      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "   " });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("không được để trống");
    });

    test("báo lỗi 409 khi tên danh mục đã tồn tại trong kho cá nhân", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue({
        id: 5,
        categoryName: "Món Chay",
        createdBy: 10,
      });

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "Món Chay" });

      expect(res.status).toBe(409);
      expect(res.body.EC).toBe(2);
      expect(res.body.EM).toContain("đã tồn tại trong danh sách của bạn");
    });

    test("trả về 201 khi tạo danh mục cá nhân thành công", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);
      jest.spyOn(db.Category, "create").mockResolvedValue({
        id: 20,
        categoryName: "Món Ăn Kiêng Keto",
        createdBy: 10,
      });

      const res = await request(app)
        .post("/api/v1/categories")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "Món Ăn Kiêng Keto" });

      expect(res.status).toBe(201);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
      expect(res.body.DT.categoryId).toBe(20);
      expect(res.body.DT.createdBy).toBe(10);
    });
  });

  describe("PUT /api/v1/categories/:categoryId (UC-25: Sửa danh mục cá nhân)", () => {
    test("chặn 401 khi không có token JWT", async () => {
      const res = await request(app)
        .put("/api/v1/categories/15")
        .send({ categoryName: "Món Mới" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("báo lỗi 404 khi không tìm thấy danh mục", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);

      const res = await request(app)
        .put("/api/v1/categories/999")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "Món Mới" });

      expect(res.status).toBe(404);
      expect(res.body.EC).toBe(3);
    });

    test("báo lỗi 403 khi sửa danh mục của người khác", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue({
        id: 15,
        categoryName: "Món Của Người Khác",
        createdBy: 99, // khác userId 10
      });

      const res = await request(app)
        .put("/api/v1/categories/15")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "Món Hack" });

      expect(res.status).toBe(403);
      expect(res.body.EC).toBe(4);
      expect(res.body.EM).toContain("Bạn không có quyền chỉnh sửa");
    });

    test("trả về 200 khi cập nhật danh mục thành công", async () => {
      const mockCategory = {
        id: 15,
        categoryName: "Món Cũ",
        createdBy: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.Category, "findOne")
        .mockResolvedValueOnce(mockCategory) // tìm thấy category
        .mockResolvedValueOnce(null);         // không trùng tên

      const res = await request(app)
        .put("/api/v1/categories/15")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ categoryName: "Món Mới Tinh" });

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("thành công");
      expect(res.body.DT.categoryName).toBe("Món Mới Tinh");
    });
  });

  describe("DELETE /api/v1/categories/:categoryId (UC-25: Xóa danh mục cá nhân)", () => {
    test("chặn 401 khi không có token JWT", async () => {
      const res = await request(app).delete("/api/v1/categories/15");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("báo lỗi 404 khi không tìm thấy danh mục cần xóa", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/v1/categories/999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.EC).toBe(3);
    });

    test("báo lỗi 403 khi xóa danh mục hệ thống hoặc của người khác", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue({
        id: 1,
        categoryName: "Món xào hệ thống",
        createdBy: null,
      });

      const res = await request(app)
        .delete("/api/v1/categories/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.EC).toBe(4);
      expect(res.body.EM).toContain("Bạn không có quyền xóa danh mục này");
    });

    test("trả về 200 khi xóa danh mục cá nhân thành công", async () => {
      const mockCategory = {
        id: 15,
        categoryName: "Món Cần Xóa",
        createdBy: 10,
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.Category, "findOne").mockResolvedValue(mockCategory);
      jest.spyOn(db.RecipeCategory, "destroy").mockResolvedValue(1);

      const res = await request(app)
        .delete("/api/v1/categories/15")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("Đã xóa danh mục cá nhân thành công");
      expect(mockCategory.destroy).toHaveBeenCalled();
    });
  });
});

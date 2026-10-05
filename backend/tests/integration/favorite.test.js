import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

describe("Favorites API Integration Tests (Supertest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: "User",
    });
  });

  describe("Favorites Endpoints Validation (UC-12)", () => {
    test("GET /api/v1/favorites - chặn 401 khi không gửi token JWT", async () => {
      const res = await request(app).get("/api/v1/favorites");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("GET /api/v1/favorites - trả về 200 và danh sách yêu thích kèm phân trang khi có token hợp lệ", async () => {
      jest.spyOn(db.FavoriteRecipe, "findAndCountAll").mockResolvedValue({
        count: 1,
        rows: [
          {
            userId: 1,
            recipeId: 101,
            personalNotes: "Nêm ớt vừa tay",
            createdAt: "2026-08-22T08:30:00.000Z",
            recipe: {
              id: 101,
              title: "Bò lúc lắc",
              thumbnailUrl: "https://cloudinary.com/bo.jpg",
              cookTimeMinutes: 25,
              difficulty: "Easy",
              author: { id: 5, username: "Chef Tuan" },
            },
          },
        ],
      });

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .get("/api/v1/favorites?page=1&limit=10")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("Thành công");
      expect(res.body.DT.page).toBe(1);
      expect(res.body.DT.limit).toBe(10);
      expect(res.body.DT.total).toBe(1);
      expect(Array.isArray(res.body.DT.items)).toBe(true);
      expect(res.body.DT.items[0].recipeId).toBe(101);
      expect(res.body.DT.items[0].title).toBe("Bò lúc lắc");
      expect(res.body.DT.items[0].personalNotes).toBe("Nêm ớt vừa tay");
    });

    test("POST /api/v1/favorites/:recipeId - chặn 401 khi không gửi token JWT", async () => {
      const res = await request(app)
        .post("/api/v1/favorites/101")
        .send({ personalNotes: "Thử nấu" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("POST /api/v1/favorites/:recipeId - trả về 400 khi recipeId không phải số", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .post("/api/v1/favorites/invalid-id")
        .set("Authorization", `Bearer ${token}`)
        .send({ personalNotes: "Thử nấu" });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("ID món ăn không hợp lệ");
    });

    test("POST /api/v1/favorites/:recipeId - trả về 201 khi thêm thành công với token hợp lệ", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 2,
        approvalStatus: "Approved",
        isPublic: true,
        isDeleted: false,
      });
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(null);
      jest.spyOn(db.FavoriteRecipe, "create").mockResolvedValue({
        userId: 1,
        recipeId: 101,
        personalNotes: "Thử nấu vào cuối tuần",
      });

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .post("/api/v1/favorites/101")
        .set("Authorization", `Bearer ${token}`)
        .send({ personalNotes: "Thử nấu vào cuối tuần" });

      expect(res.status).toBe(201);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toBe("Đã thêm vào bộ sưu tập yêu thích!");
      expect(res.body.DT).toBeNull();
    });

    test("PUT /api/v1/favorites/:recipeId - chặn 401 khi không gửi token JWT", async () => {
      const res = await request(app)
        .put("/api/v1/favorites/101")
        .send({ personalNotes: "Nấu ít ớt" });

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("PUT /api/v1/favorites/:recipeId - trả về 400 khi thiếu personalNotes", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/favorites/101")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Vui lòng nhập nội dung ghi chú!");
    });

    test("PUT /api/v1/favorites/:recipeId - trả về 200 khi cập nhật ghi chú thành công", async () => {
      const mockFavorite = {
        userId: 1,
        recipeId: 101,
        personalNotes: "Ghi chú cũ",
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(mockFavorite);

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .put("/api/v1/favorites/101")
        .set("Authorization", `Bearer ${token}`)
        .send({ personalNotes: "Nấu ít ớt lại" });

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toBe("Cập nhật ghi chú thành công!");
      expect(res.body.DT).toBeNull();
    });

    test("DELETE /api/v1/favorites/:recipeId - chặn 401 khi không gửi token JWT", async () => {
      const res = await request(app).delete("/api/v1/favorites/101");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("DELETE /api/v1/favorites/:recipeId - trả về 400 khi recipeId không phải số", async () => {
      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .delete("/api/v1/favorites/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("ID món ăn không hợp lệ!");
    });

    test("DELETE /api/v1/favorites/:recipeId - trả về 200 khi bỏ yêu thích thành công", async () => {
      const mockFavorite = {
        userId: 1,
        recipeId: 101,
        destroy: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(mockFavorite);

      const token = createJWT({ userId: 1, email: "test@example.com", role: "User" });
      const res = await request(app)
        .delete("/api/v1/favorites/101")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toBe("Đã xóa khỏi danh sách yêu thích!");
      expect(res.body.DT).toBeNull();
    });
  });
});

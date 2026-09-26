import request from "supertest";
import app from "../../src/server";
import db from "../../src/models/index";

describe("Recipe API Integration Tests (Supertest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 1,
      email: "test@example.com",
      username: "testuser",
      role: "User",
    });
  });

  describe("Recipe Scale Endpoint Validation (UC-07)", () => {
    test("GET /api/v1/recipes/:id/scale - trả về 400 khi thiếu servings", async () => {
      const res = await request(app).get("/api/v1/recipes/101/scale");

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Số khẩu phần ăn phải lớn hơn 0!");
    });

    test("GET /api/v1/recipes/:id/scale - trả về 400 khi servings âm hoặc bằng 0", async () => {
      const res = await request(app).get("/api/v1/recipes/101/scale?servings=-2");

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Số khẩu phần ăn phải lớn hơn 0!");
    });

    test("GET /api/v1/recipes/:id/scale - trả về 400 khi servings là số thập phân", async () => {
      const res = await request(app).get("/api/v1/recipes/101/scale?servings=3.5");

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toBe("Số khẩu phần ăn phải lớn hơn 0!");
    });
  });
});

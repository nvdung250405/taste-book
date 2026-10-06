import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

describe("Recipe API Integration Tests (Supertest)", () => {
  const userToken = createJWT({ userId: 10, email: "user10@example.com", role: "User" });
  const otherUserToken = createJWT({ userId: 99, email: "user99@example.com", role: "User" });

  const mockTransaction = {
    commit: jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 10,
      email: "user10@example.com",
      username: "user10",
      role: "User",
    });
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTransaction);
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

  describe("POST /api/v1/recipes (UC-08: Người dùng tạo công thức mới)", () => {
    const validRecipe = {
      title: "Canh chua cá lóc",
      description: "Món ăn thanh mát",
      cookTimeMinutes: 30,
      difficulty: "Medium",
      defaultServings: 4,
      isPublic: false,
      categories: [1],
      ingredients: [
        { customIngredientName: "Cá lóc", quantity: 500, customUnit: "gam" },
      ],
      steps: [
        { stepNumber: 1, instruction: "Làm sạch cá" },
      ],
    };

    test.each([{ unitId: 2 }, { customUnit: "kg" }, { unitId: 1, customUnit: "g" }])(
      "TC-08-25: trả HTTP 400 khi nguyên liệu hệ thống đổi đơn vị %j", async (unit) => {
        jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
        jest.spyOn(db.Ingredient, "findByPk").mockResolvedValue({
          id: 1, ingredientName: "Thịt ba chỉ heo", defaultUnitId: 1,
          defaultUnit: { id: 1, unitName: "g" },
        });
        jest.spyOn(db.Recipe, "create");
        jest.spyOn(db.RecipeIngredient, "bulkCreate");
        const res = await request(app)
          .post("/api/v1/recipes")
          .set("Authorization", `Bearer ${userToken}`)
          .send({ ...validRecipe, ingredients: [{ ingredientId: 1, quantity: 500, ...unit }] });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          EC: 1, EM: "Nguyên liệu hệ thống chỉ được sử dụng đơn vị đo mặc định của hệ thống!", DT: null,
        });
        expect(db.sequelize.transaction).not.toHaveBeenCalled();
        expect(db.Recipe.create).not.toHaveBeenCalled();
        expect(db.RecipeIngredient.bulkCreate).not.toHaveBeenCalled();
      },
    );

    test("chặn 401 khi không có JWT token", async () => {
      const res = await request(app).post("/api/v1/recipes").send(validRecipe);

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 201 và tạo công thức thành công khi có token hợp lệ", async () => {
      jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
      jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(null);
      jest.spyOn(db.Unit, "findByPk").mockResolvedValue(null);
      jest.spyOn(db.Recipe, "create").mockResolvedValue({
        id: 105,
        approvalStatus: "Approved",
      });
      jest.spyOn(db.RecipeCategory, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(db.RecipeIngredient, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(db.CookingStep, "bulkCreate").mockResolvedValue([]);

      const res = await request(app)
        .post("/api/v1/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .send(validRecipe);

      expect(res.status).toBe(201);
      expect(res.body.EC).toBe(0);
      expect(res.body.DT.recipeId).toBe(105);
    });

    test("trả về 400 khi thiếu trường dữ liệu bắt buộc (tiêu đề rỗng)", async () => {
      const res = await request(app)
        .post("/api/v1/recipes")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ ...validRecipe, title: "" });

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
    });
  });

  describe("GET /api/v1/recipes/mine (UC-09: Quản lý công thức của tôi)", () => {
    test("chặn 401 khi không gửi kèm token", async () => {
      const res = await request(app).get("/api/v1/recipes/mine");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 200 và danh sách phân trang khi có token hợp lệ", async () => {
      jest.spyOn(db.Recipe, "findAndCountAll").mockResolvedValue({
        count: 1,
        rows: [
          {
            id: 105,
            title: "Canh chua cá lóc",
            thumbnailUrl: "https://example.com/canhchua.jpg",
            cookTimeMinutes: 35,
            difficulty: "Medium",
            defaultServings: 4,
            isPublic: true,
            approvalStatus: "Pending",
            rejectionReason: null,
            createdAt: new Date(),
          },
        ],
      });

      const res = await request(app)
        .get("/api/v1/recipes/mine?page=1&limit=10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.DT.page).toBe(1);
      expect(res.body.DT.limit).toBe(10);
      expect(res.body.DT.total).toBe(1);
      expect(res.body.DT.totalPages).toBe(1);
      expect(res.body.DT.items).toHaveLength(1);
    });

    test.each([0, 101])("GET /recipes/mine?limit=%i trả HTTP 400 và không truy vấn DB", async (limit) => {
      jest.spyOn(db.Recipe, "findAndCountAll").mockResolvedValue({ count: 0, rows: [] });
      const res = await request(app)
        .get(`/api/v1/recipes/mine?limit=${limit}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        EC: 1,
        EM: "Tham số phân trang page hoặc limit không hợp lệ!",
        DT: null,
      });
      expect(db.Recipe.findAndCountAll).not.toHaveBeenCalled();
    });

    test.each([1, 100])("GET /recipes/mine?limit=%i vẫn hợp lệ", async (limit) => {
      jest.spyOn(db.Recipe, "findAndCountAll").mockResolvedValue({ count: 0, rows: [] });
      const res = await request(app)
        .get(`/api/v1/recipes/mine?limit=${limit}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.DT.limit).toBe(limit);
      expect(db.Recipe.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({ limit }));
    });

    test("trả về 400 khi query param phân trang không hợp lệ", async () => {
      const res = await request(app)
        .get("/api/v1/recipes/mine?page=0")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
    });
  });

  describe("PUT /api/v1/recipes/:recipeId (UC-10: Sửa công thức cá nhân)", () => {
    test("chặn 401 khi không gửi token", async () => {
      const res = await request(app).put("/api/v1/recipes/105").send({});

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 403 khi người dùng không phải tác giả của công thức", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 105,
        authorId: 99,
        isPublic: false,
        approvalStatus: "Approved",
      });

      const res = await request(app)
        .put("/api/v1/recipes/105")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ title: "Sửa tên" });

      expect(res.status).toBe(403);
      expect(res.body.EC).toBe(4);
      expect(res.body.EM).toContain("Bạn không có quyền chỉnh sửa");
    });
  });

  describe("DELETE /api/v1/recipes/:recipeId (UC-11: Xóa mềm công thức)", () => {
    test("chặn 401 khi không có token", async () => {
      const res = await request(app).delete("/api/v1/recipes/105");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 200 và xóa mềm công thức riêng tư thành công", async () => {
      const mockUpdate = jest.fn().mockResolvedValue(true);
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 105,
        authorId: 10,
        isPublic: false,
        update: mockUpdate,
      });

      const res = await request(app)
        .delete("/api/v1/recipes/105")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(mockUpdate).toHaveBeenCalledWith({ isDeleted: true });
    });

    test("trả về 403 khi người dùng không phải là tác giả", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 105,
        authorId: 99,
        isPublic: false,
      });

      const res = await request(app)
        .delete("/api/v1/recipes/105")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.EC).toBe(4);
    });
  });
});

describe("SP4-TASK-05: Recipe API transactions and author permissions", () => {
  const recipeId = 105;
  const recipeData = {
    title: "Canh cá", description: "Canh cá gia đình", cookTimeMinutes: 30,
    difficulty: "Medium", defaultServings: 4, isPublic: false, categories: [1],
    thumbnailUrl: "https://example.com/fish.png",
    ingredients: [{ customIngredientName: "Cá", quantity: 500, customUnit: "g" }],
    steps: [
      { stepNumber: 1, instruction: "Sơ chế cá" },
      { stepNumber: 2, instruction: "Nấu nước dùng" },
      { stepNumber: 3, instruction: "Cho cá vào và nấu chín" },
    ],
  };
  const tokenFor = (id) => createJWT({ userId: id, role: "User" });
  let transaction;
  let update;

  beforeEach(() => {
    transaction = { commit: jest.fn().mockResolvedValue(), rollback: jest.fn().mockResolvedValue() };
    update = jest.fn().mockResolvedValue();
    jest.spyOn(db.User, "findOne").mockImplementation(async ({ where }) => ({
      id: where.id, username: `user${where.id}`, role: "User",
    }));
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
    jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(null);
    jest.spyOn(db.Unit, "findByPk").mockResolvedValue(null);
    jest.spyOn(db.Recipe, "create").mockImplementation(async (data) => ({ id: recipeId, ...data }));
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
      id: recipeId, authorId: 10, isPublic: false, approvalStatus: "Approved", update,
    });
    for (const model of [db.RecipeCategory, db.RecipeIngredient, db.CookingStep]) {
      jest.spyOn(model, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(model, "destroy").mockResolvedValue(0);
    }
  });

  test.each([[false, "Approved"], [true, "Pending"]])(
    "creates all steps atomically (isPublic=%s, status=%s)", async (isPublic, approvalStatus) => {
      const res = await request(app).post("/api/v1/recipes")
        .set("Authorization", `Bearer ${tokenFor(10)}`)
        .send({ ...recipeData, isPublic, authorId: 99 });

      expect(res.status).toBe(201);
      expect(res.body.DT).toEqual({ recipeId, approvalStatus });
      expect(db.Recipe.create).toHaveBeenCalledWith(expect.objectContaining({
        authorId: 10, thumbnailUrl: recipeData.thumbnailUrl, isPublic, approvalStatus,
      }), { transaction });
      expect(db.RecipeCategory.bulkCreate).toHaveBeenCalledWith([
        { recipeId, categoryId: 1 },
      ], { transaction });
      expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith([
        { recipeId, ingredientId: null, customIngredientName: "Cá", quantity: 500,
          unitId: null, customUnit: "g" },
      ], { transaction });
      expect(db.CookingStep.bulkCreate).toHaveBeenCalledWith(
        recipeData.steps.map((step) => ({ recipeId, ...step })), { transaction },
      );
      expect(transaction.commit).toHaveBeenCalledTimes(1);
      expect(transaction.rollback).not.toHaveBeenCalled();
    },
  );

  test.each([
    [{ stepNumber: 1, instruction: "A" }, { stepNumber: 1, instruction: "B" }],
    [{ stepNumber: 1, instruction: "A" }, { stepNumber: 2, instruction: " " }],
  ])("rejects invalid steps before any writes (%j)", async (...steps) => {
    const res = await request(app).post("/api/v1/recipes")
      .set("Authorization", `Bearer ${tokenFor(10)}`).send({ ...recipeData, steps });
    expect(res.status).toBe(400);
    expect(res.body.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(db.Recipe.create).not.toHaveBeenCalled();
    expect(db.CookingStep.bulkCreate).not.toHaveBeenCalled();
  });

  test.each(["post", "put"])("%s rolls back when writing ingredients fails", async (method) => {
    db.RecipeIngredient.bulkCreate.mockRejectedValue(new Error("Ingredient write failed"));
    const path = method === "post" ? "/api/v1/recipes" : `/api/v1/recipes/${recipeId}`;
    const res = await request(app)[method](path)
      .set("Authorization", `Bearer ${tokenFor(10)}`).send(recipeData);

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ EC: -1, DT: null });
    if (method === "post") {
      expect(db.Recipe.create).toHaveBeenCalledWith(expect.any(Object), { transaction });
    } else {
      expect(update).toHaveBeenCalledWith(expect.any(Object), { transaction });
      expect(db.RecipeIngredient.destroy).toHaveBeenCalledWith({ where: { recipeId }, transaction });
    }
    expect(db.RecipeCategory.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.CookingStep.bulkCreate).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test("allows the author to update all steps", async () => {
    const res = await request(app).put(`/api/v1/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${tokenFor(10)}`).send(recipeData);
    expect(res.status).toBe(200);
    expect(res.body.EC).toBe(0);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ title: recipeData.title }), { transaction });
    expect(db.CookingStep.bulkCreate).toHaveBeenCalledWith(
      recipeData.steps.map((step) => ({ recipeId, ...step })), { transaction },
    );
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  test.each(["put", "delete"])("%s denies another user even with a forged authorId", async (method) => {
    const res = await request(app)[method](`/api/v1/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${tokenFor(99)}`)
      .send({ ...recipeData, authorId: 99 });
    expect(res.status).toBe(403);
    expect(res.body.EC).toBe(4);
    expect(update).not.toHaveBeenCalled();
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    for (const model of [db.RecipeCategory, db.RecipeIngredient, db.CookingStep]) {
      expect(model.destroy).not.toHaveBeenCalled();
      expect(model.bulkCreate).not.toHaveBeenCalled();
    }
  });
});

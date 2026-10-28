import request from "supertest";
import { Op } from "sequelize";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

beforeEach(() => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
});

describe("UC-22: API quản trị nguyên liệu", () => {
  const path = "ingredients";
  const model = "Ingredient";
  const relation = "RecipeIngredient";
  const body = { ingredientName: "Muối", ingredientCategoryId: 1, defaultUnitId: 1 };
  const token = createJWT({ userId: 1, role: "Admin" });
  let record;
  const send = (method, auth = token, data = body) => {
    const requestBuilder = request(app)[method](`/api/v1/admin/${path}${method === "post" ? "" : "/7"}`);
    if (auth) requestBuilder.set("Authorization", `Bearer ${auth}`);
    return requestBuilder.send(data);
  };
  beforeEach(() => {
    record = { id: 7, ...body, defaultUnitId: 1, destroy: jest.fn(), save: jest.fn() };
    jest.spyOn(db.User, "findOne").mockResolvedValue({ id: 1, role: "Admin" });
    jest.spyOn(db[model], "findOne").mockResolvedValue(record);
    jest.spyOn(db[relation], "count").mockResolvedValue(0);
    jest.spyOn(db.RecipeIngredient, "update").mockResolvedValue([0]);
    jest.spyOn(db.IngredientCategory, "findOne").mockResolvedValue({ id: 1 });
    jest.spyOn(db.Unit, "findOne").mockResolvedValue({ id: 1 });
  });

  test.each(["post", "put", "delete"])("%s yêu cầu JWT và quyền Admin", async method => {
    expect((await send(method, null)).status).toBe(401);
    db.User.findOne.mockResolvedValue({ id: 1, role: "User" });
    expect((await send(method)).status).toBe(403);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test.each(["post", "put", "delete"])("%s từ chối token role User trước khi xử lý dữ liệu", async method => {
    db.User.findOne.mockResolvedValue({ id: 2, role: "User" });
    const response = await send(method, createJWT({ userId: 2, role: "User" }));
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ EC: 4, DT: null });
    expect(db.Ingredient.findOne).not.toHaveBeenCalled();
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(record.save).not.toHaveBeenCalled();
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("DELETE đang được công thức sử dụng trả 409", async () => {
    db[relation].count.mockResolvedValue(1);
    const response = await send("delete");
    expect(response.status).toBe(409);
    expect(response.body.EC).toBe(2);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("DELETE chưa được sử dụng trả 200", async () => {
    expect((await send("delete")).status).toBe(200);
    expect(record.destroy).toHaveBeenCalled();
  });

  test("DELETE không tồn tại trả 404", async () => {
    db[model].findOne.mockResolvedValue(null);
    expect((await send("delete")).status).toBe(404);
  });

  test("POST tạo dữ liệu và PUT sửa dữ liệu", async () => {
    db[model].findOne.mockResolvedValue(null);
    jest.spyOn(db[model], "create").mockResolvedValue(record);
    expect((await send("post")).status).toBe(201);
    db[model].findOne.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    expect((await send("put")).status).toBe(200);
    expect(record.save).toHaveBeenCalled();
  });

  test("POST tên sai kiểu trả 400", async () => {
    const name = "ingredientName";
    expect((await send("post", token, { ...body, [name]: {} })).status).toBe(400);
  });
});

describe("UC-22: POST /api/v1/admin/ingredient-categories", () => {
  const send = (role) => {
    const call = request(app).post("/api/v1/admin/ingredient-categories");
    if (role) call.set("Authorization", `Bearer ${createJWT({ userId: role === "Admin" ? 1 : 2, role })}`);
    return call.send({ categoryName: "  Gia vị  " });
  };

  beforeEach(() => {
    jest.spyOn(db.User, "findOne").mockResolvedValue({ id: 1, role: "Admin" });
    jest.spyOn(db.IngredientCategory, "findOne").mockResolvedValue(null);
    jest.spyOn(db.IngredientCategory, "create").mockResolvedValue({ id: 7, categoryName: "Gia vị" });
  });

  test.each([[null, 401], ["User", 403]])("role %s bị chặn với %i trước khi đọc/ghi dữ liệu", async (role, status) => {
    db.User.findOne.mockResolvedValue({ id: 2, role: "User" });
    const response = await send(role);
    expect(response.status).toBe(status);
    expect(response.body.DT).toBeNull();
    expect(db.IngredientCategory.findOne).not.toHaveBeenCalled();
    expect(db.IngredientCategory.create).not.toHaveBeenCalled();
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test("Admin tạo nhóm nguyên liệu thành công trả 201", async () => {
    const response = await send("Admin");
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ EC: 0, DT: { ingredientCategoryId: 7, categoryName: "Gia vị" } });
    expect(db.IngredientCategory.create).toHaveBeenCalledWith(
      { categoryName: "Gia vị" }, { transaction: expect.any(Object) },
    );
    const transaction = await db.sequelize.transaction.mock.results[0].value;
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
});

describe("UC-22: GET /api/v1/ingredients", () => {
  beforeEach(() => {
    jest.spyOn(db.Ingredient, "findAll").mockResolvedValue([{
      id: 7, ingredientName: "Muối", defaultUnit: { id: 1, unitName: "g" },
      categoryGroup: { categoryName: "Gia vị" },
    }]);
    jest.spyOn(db.User, "findOne");
  });

  test.each([null, "User", "Admin"])("danh sách công khai trả 200 với role %s", async role => {
    const call = request(app).get("/api/v1/ingredients");
    if (role) {
      db.User.findOne.mockResolvedValue({ id: 2, role });
      call.set("Authorization", `Bearer ${createJWT({ userId: 2, role })}`);
    }
    const response = await call;
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ EC: 0, DT: [{
      ingredientId: 7, ingredientName: "Muối", defaultUnit: { unitId: 1, unitName: "g" }, categoryName: "Gia vị",
    }] });
    if (!role) expect(db.User.findOne).not.toHaveBeenCalled();
  });

  test.each(["categoryId", "ingredientCategoryId"])("lọc tên có dấu và nhóm qua %s", async key => {
    const response = await request(app).get("/api/v1/ingredients").query({ search: "  Muối  ", [key]: "1" });
    expect(response.status).toBe(200);
    const options = db.Ingredient.findAll.mock.calls[0][0];
    expect(options.where[Op.and]).toEqual([
      { ingredientName: { [Op.iLike]: "%Muối%" } }, { ingredientCategoryId: 1 },
    ]);
  });

  test("không có kết quả trả danh sách rỗng", async () => {
    db.Ingredient.findAll.mockResolvedValue([]);
    const response = await request(app).get("/api/v1/ingredients");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ EC: 0, DT: [] });
  });
});


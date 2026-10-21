import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import routes from "../../src/routes/recipeList";
import errorHandler from "../../src/middleware/errorHandler";
import db from "../../src/models/index";

jest.mock("../../src/models/index", () => ({
  User: { findOne: jest.fn() },
  RecipeList: { findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  RecipeListItem: { findOne: jest.fn(), create: jest.fn() },
  Recipe: { findOne: jest.fn() },
}));
jest.mock("../../src/config/logger", () => ({ error: jest.fn() }));

// Use the real router, controllers, services, JWT and JSON parser with mock DB only.
const app = express();
app.use(express.json());
app.use("/api/v1/recipe-lists", routes);
app.use(errorHandler);
const base = "/api/v1/recipe-lists";
const endpoints = [
  ["get", "", undefined, 200],
  ["post", "", { listName: "Menu" }, 201],
  ["put", "/1", { listName: "New Menu" }, 200],
  ["delete", "/1", undefined, 200],
  ["get", "/1", undefined, 200],
  ["post", "/1/items", { recipeId: 2, targetServings: 4 }, 201],
  ["put", "/1/items/10", { targetServings: 6 }, 200],
  ["delete", "/1/items/10", undefined, 200],
];
let token, list, item;
const originalSecret = process.env.JWT_SECRET;
afterAll(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  process.env.JWT_SECRET = "recipe-list-tests-only";
  token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: "1h" });
  list = { id: 1, userId: 1, listName: "Menu", createdAt: "2026-10-13T00:00:00.000Z", recipeListItems: [], save: jest.fn(), destroy: jest.fn() };
  item = { id: 10, recipeId: 2, targetServings: 4, update: jest.fn(), destroy: jest.fn() };
  db.User.findOne.mockResolvedValue({ id: 1, role: "User" });
  db.RecipeList.findAll.mockResolvedValue([list]);
  db.RecipeList.findByPk.mockResolvedValue(list);
  db.RecipeList.findOne.mockImplementation(async (options) => options.where.id === 1 ? list : null);
  db.RecipeList.create.mockImplementation(async (data) => ({ id: 1, ...data }));
  db.Recipe.findOne.mockResolvedValue({ authorId: 1 });
  db.RecipeListItem.findOne.mockImplementation(async (options) => options.where.id ? item : null);
  db.RecipeListItem.create.mockImplementation(async (data) => ({ id: 10, ...data }));
});
const send = (method, path, body, auth = token) => {
  const req = request(app)[method](base + path);
  if (auth) req.set("Authorization", `Bearer ${auth}`);
  if (body !== undefined) req.send(body);
  return req;
};

describe("Recipe Lists HTTP integration (mock DB only)", () => {
  test.each(endpoints)("%s %s returns expected success status", async (method, path, body, status) => {
    const res = await send(method, path, body);
    expect(res.status).toBe(status);
    expect(res.body).toMatchObject({ EC: 0, EM: expect.any(String) });
    expect(res.body).toHaveProperty("DT");
    if (method === "post") expect(res.body.DT).toMatchObject(path ? { recipeListItemId: 10, recipeId: 2, targetServings: 4 } : { recipeListId: 1, listName: "Menu" });
    if (method === "get") expect(res.body.DT).toEqual(path ? { recipeListId: 1, listName: "Menu", items: [] } : [{ recipeListId: 1, listName: "Menu", totalItems: 0, createdAt: list.createdAt }]);
    if (method === "put" || method === "delete") expect(res.body.DT).toBeNull();
  });
  describe.each(endpoints)("%s %s JWT", (method, path, body) => {
    test.each(["missing", "invalid", "expired"])("rejects %s token", async (kind) => {
      const auth = kind === "missing" ? null : kind === "invalid" ? "bad-token" : jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: -1 });
      const res = await send(method, path, body, auth);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ EC: 5, DT: null });
      expect(db.RecipeList.findByPk).not.toHaveBeenCalled();
    });
  });
  test.each(endpoints.filter(([, path]) => path))("%s %s rejects other owner", async (method, path, body) => {
    list.userId = 9;
    const res = await send(method, path, body);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ EC: 4, DT: null });
  });
  test.each(endpoints.filter(([, path]) => path))("%s %s returns missing list", async (method, path, body) => {
    db.RecipeList.findByPk.mockResolvedValue(null);
    db.RecipeList.findOne.mockResolvedValue(null);
    const res = await send(method, path, body);
    expect(res.status).toBe(404);
    expect(res.body.EC).toBe(3);
  });
  test.each([
    ["post", "", { listName: 123 }], ["put", "/1", { listName: {} }],
    ["post", "/1/items", { recipeId: true, targetServings: 4 }],
    ["post", "/1/items", { recipeId: "2", targetServings: 4 }],
    ["post", "/1/items", { recipeId: 2, targetServings: true }],
    ["put", "/1/items/10", { targetServings: 2147483648 }],
    ["get", "/2147483648", undefined], ["delete", "/1/items/1e2", undefined],
  ])("%s %s rejects invalid input %p", async (method, path, body) => {
    const res = await send(method, path, body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ EC: 1, DT: null });
  });
  describe.each([
    ["post", ""],
    ["put", "/1"],
  ])("%s %s list name validation (TC-14-09)", (method, path) => {
    test.each([123, null, "123", "  00123  "])("rejects %p without writing", async (listName) => {
      const res = await send(method, path, { listName });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        EC: 1,
        EM: typeof listName === "string"
          ? "Tên thực đơn không được chỉ chứa số!"
          : "Tên thực đơn không được để trống!",
        DT: null,
      });
      expect(db.RecipeList.create).not.toHaveBeenCalled();
      expect(list.save).not.toHaveBeenCalled();
    });
  });
  describe.each([
    ["post", "/1/items"],
    ["put", "/1/items/10"],
  ])("%s %s servings error response", (method, path) => {
    test.each([undefined, null, true, "4", [4], {}, 0, -1, 1.5, 2147483648])("rejects %p with exact message", async (targetServings) => {
      const body = method === "post" ? { recipeId: 2, targetServings } : { targetServings };
      const res = await send(method, path, body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        EC: 1,
        EM: "Số khẩu phần ăn targetServings phải lớn hơn 0!",
        DT: null,
      });
      expect(db.RecipeListItem.create).not.toHaveBeenCalled();
      expect(item.update).not.toHaveBeenCalled();
    });
  });
  test.each([
    ["post", ""],
    ["put", "/1"],
  ])("%s %s duplicate list name returns 409", async (method, path) => {
    db.RecipeList.findOne.mockResolvedValue({ id: 2, userId: 1, listName: "Menu" });
    const res = await send(method, path, { listName: "Menu" });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      EC: 2,
      EM: "Tên thực đơn này đã tồn tại trong danh sách của bạn!",
      DT: null,
    });
    expect(db.RecipeList.create).not.toHaveBeenCalled();
    expect(list.save).not.toHaveBeenCalled();
  });
  test("POST duplicate recipe item returns 409", async () => {
    db.RecipeListItem.findOne.mockResolvedValue(item);
    const res = await send("post", "/1/items", { recipeId: 2, targetServings: 4 });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      EC: 2,
      EM: "Món ăn đã có trong thực đơn, vui lòng điều chỉnh số lượng!",
      DT: null,
    });
    expect(db.RecipeListItem.create).not.toHaveBeenCalled();
  });
  test.each(["put", "delete"])("%s missing item returns 404", async (method) => {
    db.RecipeListItem.findOne.mockResolvedValue(null);
    const res = await send(method, "/1/items/10", method === "put" ? { targetServings: 4 } : undefined);
    expect(res.status).toBe(404);
    expect(res.body.EM).toBe("Không tìm thấy món ăn trong thực đơn!");
  });
  test("unavailable recipe returns 404", async () => {
    db.Recipe.findOne.mockResolvedValue(null);
    const res = await send("post", "/1/items", { recipeId: 2, targetServings: 4 });
    expect(res.status).toBe(404);
    expect(res.body.EM).toBe("Không tìm thấy công thức món ăn!");
  });
  test.each(endpoints)("%s %s DB failure returns 500", async (method, path, body) => {
    for (const model of [db.RecipeList, db.RecipeListItem, db.Recipe]) {
      for (const fn of Object.values(model)) fn.mockRejectedValue(new Error("DB unavailable"));
    }
    const res = await send(method, path, body);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
  });
});

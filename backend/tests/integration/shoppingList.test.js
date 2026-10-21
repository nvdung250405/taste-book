import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import routes from "../../src/routes/shoppingList";
import db from "../../src/models/index";

jest.mock("../../src/models/index", () => ({
  sequelize: { transaction: jest.fn() },
  User: { findOne: jest.fn() },
  RecipeList: { findAll: jest.fn() },
  ShoppingList: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
  ShoppingListRecipeList: { bulkCreate: jest.fn() },
  ShoppingListItem: { bulkCreate: jest.fn(), create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
}));

// Real router, JWT middleware, controllers and services; mock database only.
const app = express();
app.use(express.json());
app.use("/api/v1/shopping-lists", routes);
const base = "/api/v1/shopping-lists";
const endpoints = [
  ["get", "", undefined, 200],
  ["post", "", { title: "Đi chợ", recipeListIds: [1] }, 201],
  ["get", "/5", undefined, 200],
  ["patch", "/5/items/50", { isPurchased: true }, 200],
  ["post", "/5/items", { itemName: "Xà phòng", unit: "chai", totalQuantity: 1.005 }, 201],
  ["patch", "/5", { status: "Completed" }, 200],
  ["delete", "/5", undefined, 200],
  ["delete", "/5/items/purchased", undefined, 200],
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
  process.env.JWT_SECRET = "shopping-list-tests-only";
  token = jwt.sign({ userId: 10 }, process.env.JWT_SECRET, { expiresIn: "1h" });
  db.User.findOne.mockResolvedValue({ id: 10, role: "User" });
  db.sequelize.transaction.mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
  item = { id: 50, ingredientId: 1, itemName: "Thịt bò", totalQuantity: "1.01", unit: "kg", isPurchased: false };
  item.update = jest.fn(async (data) => Object.assign(item, data));
  list = { id: 5, userId: 10, title: "Đi chợ", status: "In_Progress", createdAt: "2026-10-16T08:00:00.000Z", shoppingListItems: [item], destroy: jest.fn() };
  list.update = jest.fn(async (data) => Object.assign(list, data));
  db.ShoppingList.findAll.mockResolvedValue([list]);
  db.ShoppingList.findByPk.mockResolvedValue(list);
  db.ShoppingList.findOne.mockResolvedValue(list);
  db.ShoppingList.create.mockResolvedValue(list);
  db.ShoppingListItem.findOne.mockResolvedValue(item);
  db.ShoppingListItem.findAll.mockResolvedValue([]);
  db.ShoppingListItem.create.mockImplementation(async data => ({ id: 51, ...data }));
  db.ShoppingListRecipeList.bulkCreate.mockResolvedValue([]);
  db.ShoppingListItem.bulkCreate.mockResolvedValue([]);
  db.ShoppingListItem.destroy.mockResolvedValue(3);
  db.RecipeList.findAll.mockResolvedValue([{ id: 1, userId: 10, recipeListItems: [{
    targetServings: 1, recipe: { defaultServings: 2, ingredients: [{
      ingredientId: 1, quantity: "2.01", ingredient: { ingredientName: "Thịt bò" }, unitGroup: { unitName: "kg" },
    }] },
  }] }]);
});
const send = (method, path, body, auth = token) => {
  const req = request(app)[method](base + path);
  if (auth) req.set("Authorization", `Bearer ${auth}`);
  if (body !== undefined) req.send(body);
  return req;
};

describe("Shopping Lists HTTP (mock DB)", () => {
  test("TC-18-49: thêm hai lần cùng tên và đơn vị chỉ lưu một mặt hàng", async () => {
    const records = [];
    db.ShoppingListItem.findAll.mockImplementation(async ({ where }) =>
      records.filter(row => row.shoppingListId === where.shoppingListId));
    db.ShoppingListItem.create.mockImplementation(async data => {
      const row = { id: 51 + records.length, ...data };
      records.push(row);
      return row;
    });
    const body = { itemName: "Nước rửa chén", unit: "chai", totalQuantity: 1 };
    const first = await send("post", "/5/items", body);
    expect(first.status).toBe(201);
    expect(first.body.EC).toBe(0);
    const second = await send("post", "/5/items", body);
    expect(second.status).toBe(409);
    expect(second.body).toEqual({
      EC: 2, EM: "Nguyên liệu đã tồn tại trong danh sách đi chợ!", DT: null,
    });
    expect(records).toHaveLength(1);
    expect(records[0].totalQuantity).toBe(1);
    expect(db.ShoppingListItem.create).toHaveBeenCalledTimes(1);
    // The same item can still be added to another shopping list.
    db.ShoppingList.findByPk.mockResolvedValue({ ...list, id: 6 });
    expect((await send("post", "/6/items", body)).status).toBe(201);
    expect(records).toHaveLength(2);
  });
  const successResponses = {
    "get ": { EC: 0, EM: "Thành công!", DT: [{ shoppingListId: 5, title: "Đi chợ", status: "In_Progress", createdAt: "2026-10-16T08:00:00.000Z" }] },
    "post ": { EC: 0, EM: "Đã tổng hợp danh sách đi chợ thông minh thành công!", DT: { shoppingListId: 5, title: "Đi chợ", status: "In_Progress", totalItems: 1 } },
    "get /5": { EC: 0, EM: "Thành công!", DT: { shoppingListId: 5, title: "Đi chợ", status: "In_Progress", items: [{ itemId: 50, ingredientId: 1, itemName: "Thịt bò", totalQuantity: 1.01, unit: "kg", isPurchased: false }] } },
    "patch /5/items/50": { EC: 0, EM: "Cập nhật trạng thái mặt hàng thành công!", DT: { itemId: 50, isPurchased: true } },
    "post /5/items": { EC: 0, EM: "Thêm món phát sinh thành công!", DT: { itemId: 51, itemName: "Xà phòng", totalQuantity: 1.01, unit: "chai", isPurchased: false } },
    "patch /5": { EC: 0, EM: "Cập nhật trạng thái chuyến đi chợ thành công!", DT: { shoppingListId: 5, status: "Completed" } },
    "delete /5": { EC: 0, EM: "Đã xóa danh sách đi chợ!", DT: null },
    "delete /5/items/purchased": { EC: 0, EM: "Đã xóa các mặt hàng đã mua!", DT: { shoppingListId: 5, deletedItems: 3 } },
  };
  test.each(endpoints)("%s %s trả đúng status và toàn bộ response thành công", async (method, path, body, status) => {
    const res = await send(method, path, body);
    expect(res.status).toBe(status);
    expect(res.body).toEqual(successResponses[`${method} ${path}`]);
    if (method === "post" && !path) expect(db.ShoppingListItem.bulkCreate.mock.calls[0][0][0].totalQuantity).toBe(1.01);
  });
  describe("7.6 Validation và chuyển trạng thái chuyến đi chợ", () => {
    test.each([undefined, null, "", "   ", "completed", "in_progress", "Archived", true, 1, {}, []].map(value => [value]))("trạng thái không hợp lệ %p trả 400 và không ghi CSDL", async status => {
      const res = await send("patch", "/5", { status });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        EC: 1, EM: "Trạng thái không hợp lệ (Chỉ chấp nhận 'In_Progress' hoặc 'Completed')!", DT: null,
      });
      expect(db.ShoppingList.findByPk).not.toHaveBeenCalled();
      expect(list.update).not.toHaveBeenCalled();
      expect(list.status).toBe("In_Progress");
    });
    test("chuyển Completed trở lại In_Progress rồi Completed", async () => {
      list.status = "Completed";
      for (const status of ["In_Progress", "Completed"]) {
        const res = await send("patch", "/5", { status });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          EC: 0, EM: "Cập nhật trạng thái chuyến đi chợ thành công!", DT: { shoppingListId: 5, status },
        });
        expect(list.update).toHaveBeenLastCalledWith({ status });
        expect(list.status).toBe(status);
      }
    });
  });
  describe("7.3–7.7 ID không hợp lệ", () => {
    const operations = endpoints.filter(([, path]) => path && !path.endsWith("/purchased"));
    describe.each(operations)("%s %s", (method, path, body) => {
      test.each(["abc", "5abc", "0", "-1", "1.5", "NaN", "Infinity", "-Infinity", "%20"])("shoppingListId %s trả 400 trước khi truy cập CSDL", async id => {
        const res = await send(method, path.replace("/5", `/${id}`), body);
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ EC: 1, EM: "Mã danh sách đi chợ không hợp lệ!", DT: null });
        expect(db.ShoppingList.findOne).not.toHaveBeenCalled();
        expect(db.ShoppingList.findByPk).not.toHaveBeenCalled();
        expect(db.ShoppingListItem.findOne).not.toHaveBeenCalled();
        expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
        expect(item.update).not.toHaveBeenCalled();
        expect(list.update).not.toHaveBeenCalled();
        expect(list.destroy).not.toHaveBeenCalled();
      });
    });
    test.each(["abc", "50abc", "0", "-1", "1.5", "NaN", "Infinity", "-Infinity", "%20"])("7.4 itemId %s trả 400 trước khi truy cập CSDL", async id => {
      const res = await send("patch", `/5/items/${id}`, { isPurchased: true });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ EC: 1, EM: "Mã mặt hàng không hợp lệ!", DT: null });
      expect(db.ShoppingList.findByPk).not.toHaveBeenCalled();
      expect(db.ShoppingListItem.findOne).not.toHaveBeenCalled();
      expect(item.update).not.toHaveBeenCalled();
    });
  });
  describe("7.3–7.7 Lỗi CSDL tại từng thao tác", () => {
    test.each([
      ["get", "/5", undefined, "listRead"],
      ["patch", "/5/items/50", { isPurchased: true }, "listRead"],
      ["patch", "/5/items/50", { isPurchased: true }, "itemRead"],
      ["patch", "/5/items/50", { isPurchased: true }, "itemUpdate"],
      ["post", "/5/items", { itemName: "Xà phòng", unit: "chai", totalQuantity: 1 }, "listRead"],
      ["post", "/5/items", { itemName: "Xà phòng", unit: "chai", totalQuantity: 1 }, "itemCreate"],
      ["patch", "/5", { status: "Completed" }, "listRead"],
      ["patch", "/5", { status: "Completed" }, "listUpdate"],
      ["delete", "/5", undefined, "listRead"],
      ["delete", "/5", undefined, "listDelete"],
    ])("%s %s lỗi %s trả 500", async (method, path, body, step) => {
      const operations = {
        listRead: method === "get" ? db.ShoppingList.findOne : db.ShoppingList.findByPk,
        itemRead: db.ShoppingListItem.findOne,
        itemUpdate: item.update,
        itemCreate: db.ShoppingListItem.create,
        listUpdate: list.update,
        listDelete: list.destroy,
      };
      operations[step].mockRejectedValue(new Error("Mock database unavailable"));
      const res = await send(method, path, body);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
      expect(operations[step]).toHaveBeenCalledTimes(1);
      if (step === "listRead" || step === "itemRead") {
        expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
        expect(item.update).not.toHaveBeenCalled();
        expect(list.update).not.toHaveBeenCalled();
        expect(list.destroy).not.toHaveBeenCalled();
      }
    });
  });
  describe("Response ở các trường hợp dữ liệu khác nhau", () => {
    test("7.1 tài khoản chưa có danh sách trả DT là mảng rỗng", async () => {
      db.ShoppingList.findAll.mockResolvedValue([]);
      const res = await send("get", "");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ EC: 0, EM: "Thành công!", DT: [] });
    });
    test("7.3 danh sách rỗng trả đủ metadata và items = []", async () => {
      list.shoppingListItems = [];
      const res = await send("get", "/5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ EC: 0, EM: "Thành công!", DT: {
        shoppingListId: 5, title: "Đi chợ", status: "In_Progress", items: [],
      } });
    });
    test("7.3 trả đúng ingredientId null, định tính và trạng thái đã mua", async () => {
      list.shoppingListItems = [{ id: 52, ingredientId: null, itemName: "Muối", totalQuantity: "0.00", unit: "vừa đủ", isPurchased: true }];
      const res = await send("get", "/5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ EC: 0, EM: "Thành công!", DT: {
        shoppingListId: 5, title: "Đi chợ", status: "In_Progress", items: [
          { itemId: 52, ingredientId: null, itemName: "Muối", totalQuantity: 0, unit: "vừa đủ", isPurchased: true },
        ],
      } });
    });
    test.each([true, false])("7.4 response đầy đủ khi isPurchased = %p", async isPurchased => {
      item.isPurchased = !isPurchased;
      const res = await send("patch", "/5/items/50", { isPurchased });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ EC: 0, EM: "Cập nhật trạng thái mặt hàng thành công!", DT: { itemId: 50, isPurchased } });
      expect(item.update).toHaveBeenCalledWith({ isPurchased });
      expect(item.isPurchased).toBe(isPurchased);
    });
    test("7.4 item không thuộc danh sách trả đủ response 404", async () => {
      db.ShoppingListItem.findOne.mockResolvedValue(null);
      const res = await send("patch", "/5/items/50", { isPurchased: true });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ EC: 3, EM: "Không tìm thấy mặt hàng trong danh sách!", DT: null });
      expect(db.ShoppingListItem.findOne).toHaveBeenCalledWith({ where: { id: 50, shoppingListId: 5 } });
      expect(item.update).not.toHaveBeenCalled();
    });
    test("7.5 response đầy đủ cho mặt hàng định tính", async () => {
      const res = await send("post", "/5/items", { itemName: " Muối ", unit: " vừa đủ " });
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ EC: 0, EM: "Thêm món phát sinh thành công!", DT: {
        itemId: 51, itemName: "Muối", totalQuantity: 0, unit: "vừa đủ", isPurchased: false,
      } });
      expect(db.ShoppingListItem.create).toHaveBeenCalledWith({
        shoppingListId: 5, ingredientId: null, itemName: "Muối", totalQuantity: 0, unit: "vừa đủ", isPurchased: false,
      });
    });
    test("7.7 xóa đúng danh sách và trả DT null", async () => {
      const res = await send("delete", "/5");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ EC: 0, EM: "Đã xóa danh sách đi chợ!", DT: null });
      expect(db.ShoppingList.findByPk).toHaveBeenCalledWith(5);
      expect(list.destroy).toHaveBeenCalledTimes(1);
    });
  });
  describe.each(endpoints)("%s %s xác thực", (method, path, body) => {
    test.each(["missing", "invalid", "expired"])("401 với token %s", async kind => {
      const auth = kind === "missing" ? null : kind === "invalid" ? "invalid" :
        jwt.sign({ userId: 10 }, process.env.JWT_SECRET, { expiresIn: -1 });
      const res = await send(method, path, body, auth);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ EC: 5, DT: null });
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    });
  });
  test.each(endpoints.filter(([, path]) => path))("%s %s trả 403 với người khác", async (method, path, body) => {
    list.userId = 20;
    const res = await send(method, path, body);
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ EC: 4, DT: null });
  });
  test.each(endpoints.filter(([, path]) => path))("%s %s trả 404 khi thiếu danh sách", async (method, path, body) => {
    db.ShoppingList.findByPk.mockResolvedValue(null);
    db.ShoppingList.findOne.mockResolvedValue(null);
    const res = await send(method, path, body);
    expect(res.status).toBe(404);
    expect(res.body.EC).toBe(3);
  });
  test.each([
    ["post", "", { title: true, recipeListIds: [1] }],
    ["post", "", { title: "Đi chợ", recipeListIds: [true] }],
    ["post", "/5/items", { itemName: "A", unit: "kg", totalQuantity: true }],
    ["post", "/5/items", { itemName: "A", unit: "kg", totalQuantity: 0.001 }],
    ["post", "/5/items", { itemName: {}, unit: "kg", totalQuantity: 1 }],
    ["patch", "/5/items/50", { isPurchased: "true" }],
  ])("%s %s trả 400 cho đầu vào %p", async (method, path, body) => {
    const res = await send(method, path, body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ EC: 1, DT: null });
  });
  test.each([0, 3])("xóa mục đã mua trả đúng deletedItems = %i", async deletedItems => {
    db.ShoppingListItem.destroy.mockResolvedValue(deletedItems);
    const res = await send("delete", "/5/items/purchased");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ EC: 0, EM: "Đã xóa các mặt hàng đã mua!", DT: { shoppingListId: 5, deletedItems } });
    expect(list.destroy).not.toHaveBeenCalled();
  });
  test("chỉ xóa mục đã mua trong đúng danh sách, giữ mục chưa mua và danh sách khác", async () => {
    let records = [
      { shoppingListId: 5, isPurchased: true },
      { shoppingListId: 5, isPurchased: false },
      { shoppingListId: 6, isPurchased: true },
    ];
    db.ShoppingListItem.destroy.mockImplementation(async ({ where }) => {
      const before = records.length;
      records = records.filter(row => row.shoppingListId !== where.shoppingListId || row.isPurchased !== where.isPurchased);
      return before - records.length;
    });
    expect((await send("delete", "/5/items/purchased")).body.DT.deletedItems).toBe(1);
    expect(records).toEqual([{ shoppingListId: 5, isPurchased: false }, { shoppingListId: 6, isPurchased: true }]);
    expect((await send("delete", "/5/items/purchased")).body.DT.deletedItems).toBe(0);
  });
  test.each(["abc", "0", "-1", "1.5", "1e2", "2147483648"])("xóa với ID %s trả 400", async id => {
    const res = await send("delete", `/${id}/items/purchased`);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ EC: 1, EM: "Mã danh sách đi chợ không hợp lệ!", DT: null });
    expect(db.ShoppingListItem.destroy).not.toHaveBeenCalled();
  });
  test.each(["open", "delete", "commit"])("xóa lỗi %s trả 500 và rollback nếu đã mở transaction", async step => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    db.sequelize.transaction.mockResolvedValue(transaction);
    const operation = step === "open" ? db.sequelize.transaction : step === "delete" ? db.ShoppingListItem.destroy : transaction.commit;
    operation.mockRejectedValue(new Error("offline"));
    const res = await send("delete", "/5/items/purchased");
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
    if (step !== "open") expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
  test("lỗi mở transaction trả 500 với envelope chuẩn", async () => {
    db.sequelize.transaction.mockRejectedValue(new Error("offline"));
    const res = await send("post", "", { title: "Đi chợ", recipeListIds: [1] });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
  });
});

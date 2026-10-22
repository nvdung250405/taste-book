import service from "../../src/services/shoppingListService";
import db from "../../src/models/index";

jest.mock("../../src/models/index", () => ({
  sequelize: { transaction: jest.fn() },
  RecipeList: { findAll: jest.fn() },
  ShoppingList: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn() },
  ShoppingListRecipeList: { bulkCreate: jest.fn() },
  ShoppingListItem: { bulkCreate: jest.fn(), create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(), destroy: jest.fn() },
}));

const ingredient = (quantity = "2.01", unit = "kg", ingredientId = 1) => ({
  ingredientId, quantity, ingredient: { ingredientName: "Thịt bò" }, unitGroup: { unitName: unit },
});
const meal = (ingredients = [ingredient()], targetServings = 1, defaultServings = 2) => ({
  targetServings, recipe: { defaultServings, ingredients },
});
const menu = (id = 1, items = [meal()], userId = 10) => ({ id, userId, recipeListItems: items });
const generate = (data = {}) => service.generateShoppingList(10, { title: "Đi chợ", recipeListIds: [1], ...data });
const add = (data = {}) => service.addShoppingListItem(10, 5, {
  itemName: "Nước rửa chén", unit: "chai", totalQuantity: 1, ...data,
});
const savedItems = () => db.ShoppingListItem.bulkCreate.mock.calls[0][0];
let transaction;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  transaction = { commit: jest.fn().mockResolvedValue(), rollback: jest.fn().mockResolvedValue() };
  db.sequelize.transaction.mockResolvedValue(transaction);
  db.RecipeList.findAll.mockResolvedValue([menu()]);
  db.ShoppingList.create.mockImplementation(async (data) => ({ id: 5, ...data }));
  db.ShoppingListRecipeList.bulkCreate.mockResolvedValue([]);
  db.ShoppingListItem.bulkCreate.mockResolvedValue([]);
  db.ShoppingList.findByPk.mockResolvedValue({ id: 5, userId: 10 });
  db.ShoppingListItem.findAll.mockResolvedValue([]);
  db.ShoppingListItem.create.mockImplementation(async (data) => ({ id: 50, ...data }));
});

describe("7.8 Xóa các mặt hàng đã mua", () => {
  test.each([0, 3])("thành công, xóa %i mục và giữ danh sách", async deletedItems => {
    db.ShoppingListItem.destroy.mockResolvedValue(deletedItems);
    expect(await service.deletePurchasedItems(10, "5")).toEqual({
      EC: 0, EM: "Đã xóa các mặt hàng đã mua!", DT: { shoppingListId: 5, deletedItems },
    });
    expect(db.ShoppingList.findByPk).toHaveBeenCalledWith(5, { transaction });
    expect(db.ShoppingListItem.destroy).toHaveBeenCalledWith({
      where: { shoppingListId: 5, isPurchased: true }, transaction,
    });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
  test("không xác thực thì không truy cập CSDL", async () => {
    expect((await service.deletePurchasedItems(null, 5)).EC).toBe(5);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });
  test.each([undefined, null, true, false, {}, [], 0, -1, 1.5, Infinity, "abc", "1e2", " 5", "5.0", 2147483648].map(value => [value]))("ID không hợp lệ %p", async id => {
    expect((await service.deletePurchasedItems(10, id)).EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(db.ShoppingListItem.destroy).not.toHaveBeenCalled();
  });
  test.each([[null, 3], [{ id: 5, userId: 20 }, 4]])("thiếu danh sách hoặc khác chủ sở hữu: %p", async (list, ec) => {
    db.ShoppingList.findByPk.mockResolvedValue(list);
    expect((await service.deletePurchasedItems(10, 5)).EC).toBe(ec);
    expect(db.ShoppingListItem.destroy).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });
  test("mở transaction thất bại trả lỗi chuẩn", async () => {
    db.sequelize.transaction.mockRejectedValue(new Error("offline"));
    expect(await service.deletePurchasedItems(10, 5)).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
    expect(db.ShoppingListItem.destroy).not.toHaveBeenCalled();
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
  test.each(["read", "delete", "commit"])("rollback khi %s thất bại", async step => {
    db.ShoppingListItem.destroy.mockResolvedValue(3);
    const operation = step === "read" ? db.ShoppingList.findByPk :
      step === "delete" ? db.ShoppingListItem.destroy : transaction.commit;
    operation.mockRejectedValue(new Error("database failure"));
    expect((await service.deletePurchasedItems(10, 5)).EC).toBe(-1);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    if (step !== "commit") expect(transaction.commit).not.toHaveBeenCalled();
  });
  test("lỗi rollback vẫn trả envelope 500", async () => {
    db.ShoppingListItem.destroy.mockRejectedValue(new Error("delete failed"));
    transaction.rollback.mockRejectedValue(new Error("rollback failed"));
    expect((await service.deletePurchasedItems(10, 5)).EC).toBe(-1);
  });
});

describe("RSK-01: tổng hợp chính xác và làm tròn half-up", () => {
  test("2.01 × 1/2 = 1.005 được lưu thành 1.01", async () => {
    expect((await generate()).EC).toBe(0);
    expect(savedItems()[0].totalQuantity).toBe(1.01);
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  test("cộng nhiều món, nhiều thực đơn và nhân đúng khẩu phần", async () => {
    db.RecipeList.findAll.mockResolvedValue([
      menu(1, [meal([ingredient("100", "gam")], 4, 2), meal([ingredient("60", "gam")], 1, 3)]),
      menu(2, [meal([ingredient("25", "gam")], 6, 3)]),
    ]);
    const result = await generate({ recipeListIds: [1, 2] });
    expect(result.DT.totalItems).toBe(1);
    expect(savedItems()[0]).toMatchObject({ ingredientId: 1, totalQuantity: 270, unit: "gam" });
    expect(db.ShoppingListRecipeList.bulkCreate).toHaveBeenCalledWith([
      { shoppingListId: 5, recipeListId: 1 }, { shoppingListId: 5, recipeListId: 2 },
    ], { transaction });
  });

  test("chỉ làm tròn tổng cuối: 0.005 + 0.005 = 0.01", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([ingredient("0.01")]), meal([ingredient("0.01")])])]);
    expect((await generate()).EC).toBe(0);
    expect(savedItems()[0].totalQuantity).toBe(0.01);
  });

  test("giữ chính xác tỷ lệ lặp: 0.01/3 cộng ba lần = 0.01", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, Array.from({ length: 3 }, () => meal([ingredient("0.01")], 1, 3)))]);
    expect((await generate()).EC).toBe(0);
    expect(savedItems()[0].totalQuantity).toBe(0.01);
  });

  test("khác đơn vị hoặc khác mã thì tách dòng; trim và bỏ phân biệt hoa thường đơn vị", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([
      ingredient("1", "kg"), ingredient("2", " KG "), ingredient("100", "gam"), ingredient("3", "kg", 2),
    ], 1, 1)])]);
    expect((await generate()).DT.totalItems).toBe(3);
    expect(savedItems()).toEqual(expect.arrayContaining([
      expect.objectContaining({ ingredientId: 1, unit: "kg", totalQuantity: 3 }),
      expect.objectContaining({ ingredientId: 1, unit: "gam", totalQuantity: 100 }),
      expect.objectContaining({ ingredientId: 2, unit: "kg", totalQuantity: 3 }),
    ]));
  });

  test("nguyên liệu tự nhập gộp theo tên và đơn vị", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([
      { customIngredientName: " Rau ", customUnit: "bó", quantity: "1" },
      { customIngredientName: "rau", customUnit: "bó", quantity: "2" },
    ], 1, 1)])]);
    expect((await generate()).DT.totalItems).toBe(1);
    expect(savedItems()[0]).toMatchObject({ ingredientId: null, totalQuantity: 3 });
  });

  test("đơn vị định tính giữ 0, không nhân hay cộng định lượng", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([
      ingredient("0", "vừa đủ"), ingredient("10", "vừa đủ"),
    ], 4, 2)])]);
    expect((await generate()).DT.totalItems).toBe(1);
    expect(savedItems()[0].totalQuantity).toBe(0);
  });

  test.each(["0.001", "100000000.00", "-1", "invalid", null, true, Infinity])("từ chối định lượng nguồn %p", async (quantity) => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([ingredient(quantity)], 1, 1)])]);
    expect((await generate()).EC).toBe(1);
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });

  test("từ chối tổng vượt DECIMAL(10,2) sau khi cộng", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal([ingredient("50000000"), ingredient("50000000")], 1, 1)])]);
    expect((await generate()).EC).toBe(1);
    expect(db.ShoppingListItem.bulkCreate).not.toHaveBeenCalled();
  });

  test.each(["targetServings", "defaultServings"])("từ chối %s sai thay vì mặc định về 2", async (field) => {
    for (const value of [0, -1, 1.5, undefined, null, true, "2", Infinity]) {
      const item = meal();
      if (field === "targetServings") item.targetServings = value;
      else item.recipe.defaultServings = value;
      db.RecipeList.findAll.mockResolvedValue([menu(1, [item])]);
      expect((await generate()).EC).toBe(1);
    }
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
  });
});

describe("Validation và transaction khi tổng hợp", () => {
  test.each(["Đi chợ", "  Đi chợ  "])("TC-17-12: từ chối tiêu đề đã tồn tại %p", async title => {
    db.ShoppingList.findOne.mockResolvedValue({ id: 5, userId: 10, title: "Đi chợ" });
    expect(await generate({ title })).toEqual({
      EC: 2, EM: "Tiêu đề danh sách đi chợ này đã tồn tại!", DT: null,
    });
    expect(db.ShoppingList.findOne).toHaveBeenCalledWith({
      where: { userId: 10, title: "Đi chợ" }, transaction,
    });
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
    expect(db.ShoppingListRecipeList.bulkCreate).not.toHaveBeenCalled();
    expect(db.ShoppingListItem.bulkCreate).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });
  test("lỗi truy vấn tiêu đề thì rollback và không tạo danh sách", async () => {
    db.ShoppingList.findOne.mockRejectedValue(new Error("offline"));
    expect((await generate()).EC).toBe(-1);
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
  test.each([undefined, null, true, 123, {}, [], "", "   ", "a".repeat(101)].map(value => [value]))("title không hợp lệ %p", async (title) => {
    expect((await generate({ title })).EC).toBe(1);
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
  });
  test.each([[], null, [true], ["1"], [0], [-1], [1.5], [Number.MAX_SAFE_INTEGER + 1]].map(value => [value]))("recipeListIds không hợp lệ %p", async (recipeListIds) => {
    expect((await generate({ recipeListIds })).EC).toBe(1);
  });
  test("ID thực đơn trùng chỉ tổng hợp một lần", async () => {
    expect((await generate({ recipeListIds: [1, 1] })).EC).toBe(0);
    expect(db.ShoppingListRecipeList.bulkCreate.mock.calls[0][0]).toHaveLength(1);
  });
  test("không xác thực", async () => {
    expect((await service.generateShoppingList(null, {})).EC).toBe(5);
    expect(db.RecipeList.findAll).not.toHaveBeenCalled();
  });
  test("không tìm thấy thực đơn", async () => {
    db.RecipeList.findAll.mockResolvedValue([]);
    expect((await generate()).EC).toBe(3);
  });
  test("không được dùng thực đơn người khác", async () => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, [meal()], 20)]);
    expect((await generate()).EC).toBe(4);
    expect(db.ShoppingList.create).not.toHaveBeenCalled();
  });
  test.each([[], [{ recipe: null }], [meal([])]].map(value => [value]))("thực đơn rỗng hoặc món đã xóa %p", async (items) => {
    db.RecipeList.findAll.mockResolvedValue([menu(1, items)]);
    expect((await generate()).EC).toBe(1);
  });
  test("mở transaction thất bại trả lỗi chuẩn", async () => {
    db.sequelize.transaction.mockRejectedValue(new Error("unavailable"));
    expect(await generate()).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
    expect(transaction.rollback).not.toHaveBeenCalled();
  });
  test.each(["links", "items", "commit"])("rollback khi %s thất bại", async (step) => {
    const operation = step === "links" ? db.ShoppingListRecipeList.bulkCreate :
      step === "items" ? db.ShoppingListItem.bulkCreate : transaction.commit;
    operation.mockRejectedValue(new Error("write failed"));
    expect((await generate()).EC).toBe(-1);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    if (step !== "commit") expect(transaction.commit).not.toHaveBeenCalled();
  });
  test("rollback thất bại vẫn trả response lỗi", async () => {
    db.ShoppingListItem.bulkCreate.mockRejectedValue(new Error("write failed"));
    transaction.rollback.mockRejectedValue(new Error("rollback failed"));
    expect((await generate()).EC).toBe(-1);
  });
});

describe("Thêm mặt hàng tự do", () => {
  test.each([
    ["Nước rửa chén", "chai"],
    [" NƯỚC RỬA CHÉN ", " CHAI "],
    ["Nước rửa chén".normalize("NFD"), "chai"],
  ])("TC-18-49: từ chối tên và đơn vị trùng %s / %s", async (itemName, unit) => {
    db.ShoppingListItem.findAll.mockResolvedValue([{ itemName, unit }]);
    expect(await add({ totalQuantity: 2 })).toEqual({
      EC: 2, EM: "Nguyên liệu đã tồn tại trong danh sách đi chợ!", DT: null,
    });
    expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
    expect(db.ShoppingListItem.findAll).toHaveBeenCalledWith({
      where: { shoppingListId: 5 }, attributes: ["itemName", "unit"],
    });
  });
  test.each([
    { itemName: "Nước rửa chén", unit: "lít" },
    { itemName: "Nước giặt", unit: "chai" },
  ])("cho phép tên hoặc đơn vị khác: %p", async (existing) => {
    db.ShoppingListItem.findAll.mockResolvedValue([existing]);
    expect((await add()).EC).toBe(0);
    expect(db.ShoppingListItem.create).toHaveBeenCalledTimes(1);
  });
  test("lỗi kiểm tra trùng không được tạo thêm mặt hàng", async () => {
    db.ShoppingListItem.findAll.mockRejectedValue(new Error("offline"));
    expect((await add()).EC).toBe(-1);
    expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
  });
  test("trim chuỗi, ingredientId null và half-up", async () => {
    const result = await add({ itemName: " Xà phòng ", unit: " chai ", totalQuantity: 1.005 });
    expect(result.EC).toBe(0);
    expect(result.DT).toMatchObject({ itemId: 50, itemName: "Xà phòng", unit: "chai", totalQuantity: 1.01, isPurchased: false });
    expect(db.ShoppingListItem.create.mock.calls[0][0].ingredientId).toBeNull();
  });
  test.each([true, "1", [], {}, null, "", NaN, Infinity, -1, 0, 0.001, 100000000].map(value => [value]))("từ chối số lượng %p", async (totalQuantity) => {
    expect((await add({ totalQuantity })).EC).toBe(1);
    expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
  });
  test("số lượng định lượng bắt buộc", async () => {
    expect((await add({ totalQuantity: undefined })).EC).toBe(1);
  });
  test.each(["itemName", "unit"])("%s phải là chuỗi không rỗng và tối đa 255 ký tự", async (field) => {
    for (const value of [undefined, null, true, 1, [], {}, "", " ", "a".repeat(256)]) {
      expect((await add({ [field]: value })).EC).toBe(1);
    }
    expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
  });
  test.each([undefined, 0, 2])("đơn vị định tính luôn lưu 0, đầu vào %p", async (totalQuantity) => {
    expect((await add({ unit: "vừa đủ", totalQuantity })).DT.totalQuantity).toBe(0);
  });
  test.each([[0.005, 0.01], [1e-7, null], [99999999.99, 99999999.99], [99999999.999, null]])("biên số lượng %p", async (totalQuantity, expected) => {
    const result = await add({ totalQuantity });
    if (expected === null) expect(result.EC).toBe(1);
    else expect(result.DT.totalQuantity).toBe(expected);
  });
  test("chặn người khác thêm vào danh sách", async () => {
    db.ShoppingList.findByPk.mockResolvedValue({ id: 5, userId: 20 });
    expect((await add()).EC).toBe(4);
    expect(db.ShoppingListItem.create).not.toHaveBeenCalled();
  });
  test("danh sách không tồn tại", async () => {
    db.ShoppingList.findByPk.mockResolvedValue(null);
    expect((await add()).EC).toBe(3);
  });
});

describe("Checklist và phân quyền", () => {
  test.each([true, false])("check/uncheck %p", async (isPurchased) => {
    const item = { id: 50, isPurchased: !isPurchased };
    item.update = jest.fn(async (data) => Object.assign(item, data));
    db.ShoppingListItem.findOne.mockResolvedValue(item);
    const result = await service.updateShoppingListItemStatus(10, 5, 50, { isPurchased });
    expect(result.DT).toEqual({ itemId: 50, isPurchased });
    expect(db.ShoppingListItem.findOne).toHaveBeenCalledWith({ where: { id: 50, shoppingListId: 5 } });
  });
  test.each([undefined, null, "true", 1, 0])("không ép kiểu isPurchased %p", async (isPurchased) => {
    expect((await service.updateShoppingListItemStatus(10, 5, 50, { isPurchased })).EC).toBe(1);
    expect(db.ShoppingListItem.findOne).not.toHaveBeenCalled();
  });
  test("item không thuộc danh sách hoặc không tồn tại", async () => {
    db.ShoppingListItem.findOne.mockResolvedValue(null);
    expect((await service.updateShoppingListItemStatus(10, 5, 50, { isPurchased: true })).EC).toBe(3);
  });
  test.each(["detail", "check", "status", "delete"])("chặn chủ sở hữu khác: %s", async (action) => {
    db.ShoppingList.findByPk.mockResolvedValue({ id: 5, userId: 20 });
    db.ShoppingList.findOne.mockResolvedValue({ id: 5, userId: 20 });
    const calls = {
      detail: () => service.getShoppingListDetail(10, 5),
      check: () => service.updateShoppingListItemStatus(10, 5, 50, { isPurchased: true }),
      status: () => service.updateShoppingListStatus(10, 5, { status: "Completed" }),
      delete: () => service.deleteShoppingList(10, 5),
    };
    expect((await calls[action]()).EC).toBe(4);
    expect(db.ShoppingListItem.findOne).not.toHaveBeenCalled();
  });
  test("get chỉ lấy danh sách thuộc user hiện tại", async () => {
    db.ShoppingList.findAll.mockResolvedValue([]);
    expect((await service.getShoppingLists(10)).EC).toBe(0);
    expect(db.ShoppingList.findAll.mock.calls[0][0].where).toEqual({ userId: 10 });
  });
});

describe("ShoppingListService - nguyên liệu định tính (UC-18)", () => {
  test("giữ 'vừa đủ' với totalQuantity = 0 và vẫn cộng nguyên liệu định lượng", async () => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.RecipeList, "findAll").mockResolvedValue([{
      id: 1,
      userId: 10,
      recipeListItems: [{
        targetServings: 4,
        recipe: {
          defaultServings: 2,
          ingredients: [
            { ingredientId: 1, quantity: 100, ingredient: { ingredientName: "Thịt bò" }, unitGroup: { unitName: "gam" } },
            { ingredientId: 2, quantity: 0, ingredient: { ingredientName: "Muối" }, customUnit: "vừa đủ" },
          ],
        },
      }],
    }]);
    jest.spyOn(db.ShoppingList, "create").mockResolvedValue({ id: 5, title: "Đi chợ", status: "In_Progress" });
    jest.spyOn(db.ShoppingListRecipeList, "bulkCreate").mockResolvedValue([]);
    jest.spyOn(db.ShoppingListItem, "bulkCreate").mockResolvedValue([]);

    const res = await service.generateShoppingList(10, { title: "Đi chợ", recipeListIds: [1] });

    expect(res.EC).toBe(0);
    const items = db.ShoppingListItem.bulkCreate.mock.calls[0][0];
    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({ itemName: "Thịt bò", totalQuantity: 200, unit: "gam" }),
      expect.objectContaining({ itemName: "Muối", totalQuantity: 0, unit: "vừa đủ" }),
    ]));
  });
});

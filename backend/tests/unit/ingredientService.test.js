import ingredientService from "../../src/services/ingredientService";
import db from "../../src/models/index";

beforeEach(() => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
});

describe("UC-22: nguyên liệu và transaction", () => {
  let transaction;
  let record;
  const cases = [
    ["nguyên liệu", ingredientService, "Ingredient", "deleteAdminIngredient", "RecipeIngredient"],
  ];
  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    record = { id: 7, ingredientName: "Muối", destroy: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(record);
    jest.spyOn(db.RecipeIngredient, "count").mockResolvedValue(0);
    jest.spyOn(db.RecipeIngredient, "update").mockResolvedValue([0]);
    jest.spyOn(db.IngredientCategory, "findOne").mockResolvedValue({ id: 7 });
    jest.spyOn(db.Unit, "findOne").mockResolvedValue({ id: 7 });
  });

  test.each(cases)("%s: chặn xóa đang dùng, không thay đổi lịch sử", async (_, service, model, method, relation) => {
    db[relation].count.mockResolvedValue(1);
    const result = await service[method](7);
    expect(result.EC).toBe(2);
    expect(db[relation].count).toHaveBeenCalledWith(expect.objectContaining({
      transaction,
      include: [expect.objectContaining({ required: true, where: { isDeleted: false } })],
    }));
    expect(record.destroy).not.toHaveBeenCalled();
    expect(db.RecipeIngredient.update).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test.each(cases)("%s: xóa chưa dùng và giữ tên lịch sử trong cùng transaction", async (_, service, model, method) => {
    expect((await service[method](7)).EC).toBe(0);
    expect(db.sequelize.query).toHaveBeenCalledWith("SELECT pg_advisory_xact_lock(2102223)", { transaction });
    expect(record.destroy).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(db.RecipeIngredient.update).toHaveBeenCalledWith(
      { customIngredientName: "Muối" },
      expect.objectContaining({ transaction, validate: false }),
    );
    expect(db.sequelize.query.mock.invocationCallOrder[0]).toBeLessThan(db[model].findOne.mock.invocationCallOrder[0]);
  });

  test.each(cases)("%s: rollback khi xóa thất bại sau khi xử lý lịch sử", async (_, service, model, method) => {
    record.destroy.mockRejectedValue(new Error("delete failed"));
    expect((await service[method](7)).EC).toBe(-1);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test.each(cases)("%s: bản ghi không tồn tại", async (_, service, model, method) => {
    db[model].findOne.mockResolvedValue(null);
    expect((await service[method](7)).EC).toBe(3);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test.each([0, 1])("đổi đơn vị mặc định tùy theo số công thức hoạt động sử dụng: %i", async usage => {
    const ingredient = { id: 7, defaultUnitId: 1, save: jest.fn() };
    db.Ingredient.findOne.mockResolvedValueOnce(ingredient).mockResolvedValueOnce(null);
    db.Unit.findOne.mockResolvedValue({ id: 2 });
    jest.spyOn(db.RecipeIngredient, "count").mockResolvedValue(usage);
    const result = await ingredientService.updateAdminIngredient(7, {
      ingredientName: "Muối", ingredientCategoryId: 7, defaultUnitId: 2,
    });
    expect(db.RecipeIngredient.count).toHaveBeenCalledWith({
      where: { ingredientId: 7 },
      include: [{ model: db.Recipe, as: "recipe", required: true, where: { isDeleted: false } }],
      transaction,
    });
    if (usage > 0) {
      expect(result.EC).toBe(2);
      expect(result.EM).toBe("Không thể đổi đơn vị mặc định của nguyên liệu đang được công thức hoạt động sử dụng!");
      expect(ingredient.defaultUnitId).toBe(1);
      expect(ingredient.save).not.toHaveBeenCalled();
      expect(transaction.rollback).toHaveBeenCalledTimes(1);
      expect(transaction.commit).not.toHaveBeenCalled();
    } else {
      expect(result.EC).toBe(0);
      expect(ingredient.defaultUnitId).toBe(2);
      expect(ingredient.save).toHaveBeenCalledWith({ transaction });
      expect(transaction.commit).toHaveBeenCalledTimes(1);
      expect(transaction.rollback).not.toHaveBeenCalled();
    }
  });

  test("cho phép sửa nguyên liệu khi giữ nguyên đơn vị mặc định", async () => {
    const ingredient = { id: 7, defaultUnitId: 1, save: jest.fn() };
    db.Ingredient.findOne.mockResolvedValueOnce(ingredient).mockResolvedValueOnce(null);
    db.Unit.findOne.mockResolvedValue({ id: 1 });
    const result = await ingredientService.updateAdminIngredient(7, {
      ingredientName: "Muối biển", ingredientCategoryId: 7, defaultUnitId: "1",
    });
    expect(result.EC).toBe(0);
    expect(ingredient.defaultUnitId).toBe(1);
    expect(ingredient.ingredientName).toBe("Muối biển");
    expect(ingredient.save).toHaveBeenCalledWith({ transaction });
  });

  const createCases = [
    [ingredientService.createAdminIngredient, "ingredientName", 255],
  ];
  test.each(createCases)("từ chối tên sai kiểu, rỗng và quá dài (%s)", async (create, field, max) => {
    for (const value of [123, true, {}, [], " ", "x".repeat(max + 1)]) {
      expect((await create({ [field]: value })).EC).toBe(1);
    }
  });

  test.each(createCases)("từ chối tên trùng (%s)", async (create, field) => {
    expect((await create({ [field]: "Muối", ingredientCategoryId: 7, defaultUnitId: 7 })).EC).toBe(2);
  });

  test.each(cases)("%s: ID phải là số nguyên dương", async (_, service, model, method) => {
    for (const id of [true, [], {}, -1, 0, 1.5, "1e2", "abc"]) {
      expect((await service[method](id)).EC).toBe(3);
    }
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("lỗi lấy khóa rollback trước khi kiểm tra hoặc sửa dữ liệu", async () => {
    db.sequelize.query.mockRejectedValueOnce(new Error("lock failed"));
    expect((await ingredientService.deleteAdminIngredient(7)).EC).toBe(-1);
    expect(db.Ingredient.findOne).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
});


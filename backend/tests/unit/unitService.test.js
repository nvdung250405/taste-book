import unitService from "../../src/services/unitService";
import db from "../../src/models/index";

beforeEach(() => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
});

describe("UC-23: đơn vị đo và transaction", () => {
  let transaction;
  let record;
  const cases = [
    ["đơn vị", unitService, "Unit", "deleteAdminUnit", "RecipeIngredient"],
  ];
  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    record = { id: 7, unitName: "g", destroy: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Unit, "findOne").mockResolvedValue(record);
    jest.spyOn(db.RecipeIngredient, "count").mockResolvedValue(0);
    jest.spyOn(db.RecipeIngredient, "update").mockResolvedValue([0]);
    jest.spyOn(db.Ingredient, "count").mockResolvedValue(0);
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
      { customUnit: "g" },
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

  test("không xóa đơn vị mặc định dù chưa có công thức", async () => {
    db.Ingredient.count.mockResolvedValue(1);
    expect((await unitService.deleteAdminUnit(7)).EC).toBe(2);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("cho phép đổi tên đơn vị đang được công thức và nguyên liệu chuẩn sử dụng", async () => {
    record.save = jest.fn();
    db.Unit.findOne.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    db.RecipeIngredient.count.mockResolvedValue(1);
    db.Ingredient.count.mockResolvedValue(1);

    const result = await unitService.updateAdminUnit(7, { unitName: "gam" });

    expect(result.EC).toBe(0);
    expect(record.unitName).toBe("gam");
    expect(record.id).toBe(7);
    expect(record.save).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });

  const createCases = [
    [unitService.createAdminUnit, "unitName", 30],
  ];
  test.each(createCases)("từ chối tên sai kiểu, rỗng và quá dài (%s)", async (create, field, max) => {
    for (const value of [123, true, {}, [], " ", "x".repeat(max + 1)]) {
      expect((await create({ [field]: value })).EC).toBe(1);
    }
  });

  test.each(createCases)("từ chối tên trùng (%s)", async (create, field) => {
    expect((await create({ [field]: "Tên trùng" })).EC).toBe(2);
  });

  test.each(cases)("%s: ID phải là số nguyên dương", async (_, service, model, method) => {
    for (const id of [true, [], {}, -1, 0, 1.5, "1e2", "abc"]) {
      expect((await service[method](id)).EC).toBe(3);
    }
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("lỗi lấy khóa rollback trước khi kiểm tra hoặc sửa dữ liệu", async () => {
    db.sequelize.query.mockRejectedValueOnce(new Error("lock failed"));
    expect((await unitService.deleteAdminUnit(7)).EC).toBe(-1);
    expect(db.Unit.findOne).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
});


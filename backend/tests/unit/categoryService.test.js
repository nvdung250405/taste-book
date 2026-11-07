import categoryService from "../../src/services/categoryService";
import db from "../../src/models/index";

beforeEach(() => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
});

describe("UC-21: danh mục và transaction", () => {
  let transaction;
  let record;
  const cases = [
    ["danh mục", categoryService, "Category", "deleteAdminCategory", "RecipeCategory"],
  ];
  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    record = { id: 7, categoryName: "Món kho", destroy: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Category, "findOne").mockResolvedValue(record);
    jest.spyOn(db.RecipeCategory, "count").mockResolvedValue(0);
    jest.spyOn(db.RecipeCategory, "destroy").mockResolvedValue(0);
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
    expect(db.RecipeCategory.destroy).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test.each(cases)("%s: xóa chưa dùng và giữ tên lịch sử trong cùng transaction", async (_, service, model, method) => {
    expect((await service[method](7)).EC).toBe(0);
    expect(db.sequelize.query).toHaveBeenCalledWith("SELECT pg_advisory_xact_lock(2102223)", { transaction });
    expect(record.destroy).toHaveBeenCalledWith({ transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
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

  const createCases = [
    [categoryService.createAdminCategory, "categoryName", 255],
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
    expect((await categoryService.deleteAdminCategory(7)).EC).toBe(-1);
    expect(db.Category.findOne).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
  });
});

describe("CategoryService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategories (UC-06 / UC-08)", () => {
    test("thành công: lấy danh mục hệ thống và danh mục cá nhân của người dùng (EC: 0)", async () => {
      const mockCategories = [
        { id: 1, categoryName: "Món xào", createdBy: null },
        { id: 2, categoryName: "Món kho", createdBy: null },
        { id: 10, categoryName: "Món ăn kiêng của tôi", createdBy: 5 },
      ];

      jest.spyOn(db.Category, "findAll").mockResolvedValue(mockCategories);

      const res = await categoryService.getCategories(5);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toHaveLength(3);
      expect(res.DT[2].categoryId).toBe(10);
      expect(res.DT[2].createdBy).toBe(5);
    });

    test("thành công: người dùng chưa đăng nhập chỉ lấy danh mục chuẩn hệ thống (EC: 0)", async () => {
      const mockSystemCategories = [
        { id: 1, categoryName: "Món xào", createdBy: null },
        { id: 2, categoryName: "Món kho", createdBy: null },
      ];

      jest.spyOn(db.Category, "findAll").mockResolvedValue(mockSystemCategories);

      const res = await categoryService.getCategories(null);

      expect(res.EC).toBe(0);
      expect(res.DT).toHaveLength(2);
    });

    test("thất bại: lỗi kết nối cơ sở dữ liệu (EC: -1)", async () => {
      jest.spyOn(db.Category, "findAll").mockRejectedValue(new Error("DB Error"));

      const res = await categoryService.getCategories(5);

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
      expect(res.DT).toBeNull();
    });
  });

  describe("createPersonalCategory (UC-25)", () => {
    test("thành công: tạo danh mục cá nhân mới hợp lệ (EC: 0)", async () => {
      const mockCreated = {
        id: 15,
        categoryName: "Món Ăn Healthy",
        createdBy: 10,
      };

      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);
      jest.spyOn(db.Category, "create").mockResolvedValue(mockCreated);

      const res = await categoryService.createPersonalCategory(10, {
        categoryName: "Món Ăn Healthy",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT.categoryId).toBe(15);
      expect(res.DT.categoryName).toBe("Món Ăn Healthy");
      expect(res.DT.createdBy).toBe(10);
      expect(db.Category.create).toHaveBeenCalledWith({
        categoryName: "Món Ăn Healthy",
        createdBy: 10,
      });
    });

    test("thất bại: tên danh mục bị để trống hoặc chỉ có khoảng trắng (EC: 1)", async () => {
      const res = await categoryService.createPersonalCategory(10, {
        categoryName: "   ",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được để trống");
      expect(res.DT).toBeNull();
    });

    test("thất bại: thiếu body hoặc không truyền categoryName (EC: 1)", async () => {
      const res = await categoryService.createPersonalCategory(10, null);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được để trống");
    });

    test("thất bại: tên danh mục đã tồn tại trong kho cá nhân của người dùng (EC: 2)", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue({
        id: 12,
        categoryName: "Món Ăn Healthy",
        createdBy: 10,
      });

      const res = await categoryService.createPersonalCategory(10, {
        categoryName: "món ăn healthy",
      });

      expect(res.EC).toBe(2);
      expect(res.EM).toContain("đã tồn tại trong danh sách của bạn");
      expect(res.DT).toBeNull();
    });

    test("thất bại: lỗi kết nối cơ sở dữ liệu khi tạo (EC: -1)", async () => {
      jest.spyOn(db.Category, "findOne").mockRejectedValue(new Error("DB Error"));

      const res = await categoryService.createPersonalCategory(10, {
        categoryName: "Món mới",
      });

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
    });
  });

  describe("updatePersonalCategory (UC-25)", () => {
    test("thành công: cập nhật tên danh mục cá nhân hợp lệ (EC: 0)", async () => {
      const mockCategory = {
        id: 15,
        categoryName: "Món Cũ",
        createdBy: 10,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.Category, "findOne")
        .mockResolvedValueOnce(mockCategory) // find category to update
        .mockResolvedValueOnce(null);         // check duplicate name with other categories

      const res = await categoryService.updatePersonalCategory(10, 15, {
        categoryName: "Món Mới Cập Nhật",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(mockCategory.categoryName).toBe("Món Mới Cập Nhật");
      expect(mockCategory.save).toHaveBeenCalled();
      expect(res.DT.categoryId).toBe(15);
      expect(res.DT.categoryName).toBe("Món Mới Cập Nhật");
    });

    test("thất bại: tên danh mục mới bị để trống (EC: 1)", async () => {
      const res = await categoryService.updatePersonalCategory(10, 15, {
        categoryName: "   ",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được để trống");
    });

    test("thất bại: ID danh mục không hợp lệ (EC: 3)", async () => {
      const res = await categoryService.updatePersonalCategory(10, "invalid-id", {
        categoryName: "Món Hợp Lệ",
      });

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy danh mục");
    });

    test("thất bại: không tìm thấy danh mục trong cơ sở dữ liệu (EC: 3)", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);

      const res = await categoryService.updatePersonalCategory(10, 999, {
        categoryName: "Món Hợp Lệ",
      });

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy danh mục");
    });

    test("thất bại: người dùng cố sửa danh mục của người khác hoặc danh mục chuẩn hệ thống (EC: 4)", async () => {
      const mockCategoryOfOtherUser = {
        id: 15,
        categoryName: "Món Của Người Khác",
        createdBy: 99, // khác userId 10
      };

      jest.spyOn(db.Category, "findOne").mockResolvedValue(mockCategoryOfOtherUser);

      const res = await categoryService.updatePersonalCategory(10, 15, {
        categoryName: "Món Hack",
      });

      expect(res.EC).toBe(4);
      expect(res.EM).toContain("Bạn không có quyền chỉnh sửa");
    });

    test("thất bại: tên mới trùng với một danh mục cá nhân khác của chính mình (EC: 2)", async () => {
      const mockCategory = {
        id: 15,
        categoryName: "Món Hiện Tại",
        createdBy: 10,
      };

      const mockExistingOtherCategory = {
        id: 16,
        categoryName: "Món Khác",
        createdBy: 10,
      };

      jest.spyOn(db.Category, "findOne")
        .mockResolvedValueOnce(mockCategory)              // find category
        .mockResolvedValueOnce(mockExistingOtherCategory); // duplicate found

      const res = await categoryService.updatePersonalCategory(10, 15, {
        categoryName: "Món Khác",
      });

      expect(res.EC).toBe(2);
      expect(res.EM).toContain("đã tồn tại trong danh sách của bạn");
    });

    test("thất bại: lỗi kết nối cơ sở dữ liệu khi sửa (EC: -1)", async () => {
      jest.spyOn(db.Category, "findOne").mockRejectedValue(new Error("DB Error"));

      const res = await categoryService.updatePersonalCategory(10, 15, {
        categoryName: "Món Mới",
      });

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
    });
  });

  describe("deletePersonalCategory (UC-25)", () => {
    test("thành công: xóa danh mục cá nhân và gỡ liên kết công thức (EC: 0)", async () => {
      const mockCategory = {
        id: 15,
        categoryName: "Món Cần Xóa",
        createdBy: 10,
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.Category, "findOne").mockResolvedValue(mockCategory);
      jest.spyOn(db.RecipeCategory, "destroy").mockResolvedValue(2); // xóa 2 liên kết công thức

      const res = await categoryService.deletePersonalCategory(10, 15);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Đã xóa danh mục cá nhân thành công");
      expect(db.RecipeCategory.destroy).toHaveBeenCalledWith({ where: { categoryId: 15 }, transaction: expect.any(Object) });
      expect(mockCategory.destroy).toHaveBeenCalled();
    });

    test("thất bại: ID danh mục không hợp lệ (EC: 3)", async () => {
      const res = await categoryService.deletePersonalCategory(10, "abc");

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy danh mục");
    });

    test("thất bại: không tìm thấy danh mục cần xóa (EC: 3)", async () => {
      jest.spyOn(db.Category, "findOne").mockResolvedValue(null);

      const res = await categoryService.deletePersonalCategory(10, 999);

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy danh mục");
    });

    test("thất bại: người dùng cố xóa danh mục của người khác hoặc danh mục chuẩn hệ thống (EC: 4)", async () => {
      const mockSystemCategory = {
        id: 1,
        categoryName: "Món xào (Hệ thống)",
        createdBy: null, // Danh mục chuẩn hệ thống
      };

      jest.spyOn(db.Category, "findOne").mockResolvedValue(mockSystemCategory);

      const res = await categoryService.deletePersonalCategory(10, 1);

      expect(res.EC).toBe(4);
      expect(res.EM).toContain("Bạn không có quyền xóa danh mục này");
    });

    test("thất bại: lỗi kết nối cơ sở dữ liệu khi xóa (EC: -1)", async () => {
      jest.spyOn(db.Category, "findOne").mockRejectedValue(new Error("DB Error"));

      const res = await categoryService.deletePersonalCategory(10, 15);

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
    });
  });
});

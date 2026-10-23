import recipeService from "../../src/services/recipeService";
import db from "../../src/models/index";

// ==================== TEST CÔNG THỨC CHO USER ====================
describe("Kiểm thử đơn vị dịch vụ công thức", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("scaleRecipeIngredients (UC-07 - Thuật toán đổi định lượng)", () => {
    const mockRecipe = {
      id: 101,
      title: "Bò lúc lắc",
      defaultServings: 2,
      isPublic: true,
      approvalStatus: "Approved",
      authorId: 10,
      ingredients: [
        {
          quantity: 300,
          ingredient: { id: 1, ingredientName: "Thịt bò" },
          unitGroup: { id: 1, unitName: "gam" },
        },
        {
          quantity: 1,
          ingredient: { id: 2, ingredientName: "Muối" },
          unitGroup: { id: 23, unitName: "vừa đủ" }, // Đơn vị định tính
        },
        {
          quantity: 2,
          ingredient: { id: 3, ingredientName: "Tiêu" },
          unitGroup: { id: 24, unitName: "tùy khẩu vị" }, // Đơn vị định tính
        },
      ],
    };

    test("thành công: tính toán định lượng tỷ lệ thuận theo 4 người ăn (EC: 0, scaleFactor: 2)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(mockRecipe);

      const res = await recipeService.scaleRecipeIngredients(101, { servings: 4 });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT.scaleFactor).toBe(2);
      expect(res.DT.targetServings).toBe(4);

      // Nguyên liệu định lượng định chuẩn (Thịt bò 300g * 2 = 600g)
      const beef = res.DT.ingredients.find((i) => i.ingredientName === "Thịt bò");
      expect(beef.scaledQuantity).toBe(600);

      // Nguyên liệu định tính ("vừa đủ", "tùy khẩu vị") KHÔNG bị nhân hệ số
      const salt = res.DT.ingredients.find((i) => i.ingredientName === "Muối");
      expect(salt.scaledQuantity).toBe(1);

      const pepper = res.DT.ingredients.find((i) => i.ingredientName === "Tiêu");
      expect(pepper.scaledQuantity).toBe(2);
    });

    test("giữ quantity = 0 và đơn vị vừa đủ khi đổi khẩu phần", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        ...mockRecipe,
        ingredients: [{ quantity: 0, ingredientId: null, customIngredientName: "Muối", customUnit: "vừa đủ" }],
      });

      const res = await recipeService.scaleRecipeIngredients(101, { servings: 4 });

      expect(res.EC).toBe(0);
      expect(res.DT.ingredients[0]).toMatchObject({ ingredientName: "Muối", scaledQuantity: 0, unit: "vừa đủ" });
    });

    test("thất bại: số người ăn âm hoặc bằng 0 (EC: 1)", async () => {
      const res1 = await recipeService.scaleRecipeIngredients(101, { servings: 0 });
      expect(res1.EC).toBe(1);
      expect(res1.EM).toContain("phải lớn hơn 0");

      const res2 = await recipeService.scaleRecipeIngredients(101, { servings: -3 });
      expect(res2.EC).toBe(1);
      expect(res2.EM).toContain("phải lớn hơn 0");
    });

    test("thất bại: số người ăn là số thập phân không phải số nguyên (EC: 1)", async () => {
      const res = await recipeService.scaleRecipeIngredients(101, { servings: 2.5 });
      expect(res.EC).toBe(1);
      expect(res.EM).toContain("phải lớn hơn 0");
    });

    test("thất bại: số người ăn không phải là số (EC: 1)", async () => {
      const res = await recipeService.scaleRecipeIngredients(101, { servings: "abc" });
      expect(res.EC).toBe(1);
      expect(res.EM).toContain("phải lớn hơn 0");
    });

    test("thất bại: không tìm thấy công thức nấu ăn (EC: 3)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);

      const res = await recipeService.scaleRecipeIngredients(999, { servings: 4 });
      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy");
    });

    test("bảo mật: bài viết riêng tư hoặc chờ duyệt bị chặn với người ngoài (EC: 3)", async () => {
      const privateRecipe = {
        ...mockRecipe,
        isPublic: false,
        approvalStatus: "Pending",
        authorId: 10,
      };
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(privateRecipe);

      // Khách vãng lai gọi vào (viewerId = null)
      const resStranger = await recipeService.scaleRecipeIngredients(101, { servings: 4 }, null, null);
      expect(resStranger.EC).toBe(3);

      // Tác giả tự gọi vào (viewerId = 10) -> cho phép
      const resOwner = await recipeService.scaleRecipeIngredients(101, { servings: 4 }, 10, "User");
      expect(resOwner.EC).toBe(0);

    });

    test("an toàn: phòng vệ chia cho 0 khi defaultServings bị null hoặc 0", async () => {
      const zeroServingsRecipe = {
        ...mockRecipe,
        defaultServings: 0,
      };
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(zeroServingsRecipe);

      const res = await recipeService.scaleRecipeIngredients(101, { servings: 4 });
      expect(res.EC).toBe(0);
      expect(Number.isFinite(res.DT.scaleFactor)).toBe(true);
    });
  });

  describe("getRecipeById (UC-07 - Xem chi tiết công thức)", () => {
    test("thành công: lấy chi tiết công thức công khai đã duyệt (EC: 0)", async () => {
      const mockRecipe = {
        id: 101,
        title: "Bò lúc lắc",
        description: "Món ăn ngon",
        cookTimeMinutes: 25,
        difficulty: "Easy",
        defaultServings: 2,
        isPublic: true,
        approvalStatus: "Approved",
        authorId: 10,
        author: { username: "NguyenVanA" },
        categories: [{ id: 1, categoryName: "Món xào", createdBy: null }],
        ingredients: [
          {
            quantity: 300,
            ingredient: { id: 1, ingredientName: "Thịt bò" },
            unitGroup: { id: 1, unitName: "gam" },
          },
        ],
        cookingSteps: [
          { stepNumber: 1, instruction: "Thái thịt bò" },
        ],
      };

      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(mockRecipe);

      const res = await recipeService.getRecipeById(101);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Thành công");
      expect(res.DT.title).toBe("Bò lúc lắc");
      expect(res.DT.ingredients).toHaveLength(1);
      expect(res.DT.steps).toHaveLength(1);
    });

    test("thất bại: ID công thức không hợp lệ hoặc không tồn tại (EC: 3)", async () => {
      const resInvalid = await recipeService.getRecipeById(-5);
      expect(resInvalid.EC).toBe(3);

      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);
      const resNotFound = await recipeService.getRecipeById(999);
      expect(resNotFound.EC).toBe(3);
    });

    test("bảo mật: bài viết riêng tư cho phép tác giả xem và chặn người ngoài (EC: 3)", async () => {
      const pendingRecipe = {
        id: 102,
        title: "Món nháp",
        isPublic: false,
        approvalStatus: "Pending",
        authorId: 10,
      };

      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(pendingRecipe);

      // Người lạ xem -> 404
      const resStranger = await recipeService.getRecipeById(102, 999, "User");
      expect(resStranger.EC).toBe(3);

      // Chính tác giả xem -> 200
      const resOwner = await recipeService.getRecipeById(102, 10, "User");
      expect(resOwner.EC).toBe(0);
    });
  });

  describe("getRecipes (UC-06 - Tìm kiếm và lọc công thức)", () => {
    test("thành công: tìm kiếm công thức với phân trang và độ khó hợp lệ (EC: 0)", async () => {
      jest.spyOn(db.RecipeIngredient, "findAll").mockResolvedValue([
        { recipeId: 101 },
      ]);

      jest.spyOn(db.Recipe, "findAndCountAll").mockResolvedValue({
        count: 1,
        rows: [
          {
            id: 101,
            title: "Bò lúc lắc",
            cookTimeMinutes: 25,
            difficulty: "Easy",
            defaultServings: 2,
            author: { username: "NguyenVanA" },
          },
        ],
      });

      const res = await recipeService.getRecipes({
        page: 1,
        limit: 10,
        difficulty: "Easy",
        keyword: "bò",
      });

      expect(res.EC).toBe(0);
      expect(res.DT.recipes).toHaveLength(1);
      expect(res.DT.total).toBe(1);
    });

    test("thất bại: tham số phân trang page hoặc limit không hợp lệ (EC: 1)", async () => {
      const res = await recipeService.getRecipes({ page: 0 });
      expect(res.EC).toBe(1);
      expect(res.EM).toContain("phân trang");
    });

    test("thất bại: độ khó không hợp lệ (EC: 1)", async () => {
      const res = await recipeService.getRecipes({ difficulty: "SuperHard" });
      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Độ khó không hợp lệ");
    });
  });

  describe("updateRecipe (UC-10 - Sửa công thức cá nhân)", () => {
    test("thất bại: thiếu userId hoặc chưa đăng nhập (EC: 5)", async () => {
      const res = await recipeService.updateRecipe(101, null, {});
      expect(res.EC).toBe(5);
    });

    test("thất bại: ID công thức không hợp lệ (EC: 1)", async () => {
      const res = await recipeService.updateRecipe(-1, { id: 10 }, {});
      expect(res.EC).toBe(1);
    });

    test("thất bại: không tìm thấy công thức cần cập nhật (EC: 3)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);
      const res = await recipeService.updateRecipe(999, { id: 10 }, {});
      expect(res.EC).toBe(3);
    });

    test("thất bại: người dùng không phải là tác giả của công thức (EC: 4)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 99,
        isPublic: false,
        approvalStatus: "Approved",
      });
      const res = await recipeService.updateRecipe(101, { id: 10 }, {});
      expect(res.EC).toBe(4);
      expect(res.EM).toContain("Bạn không có quyền chỉnh sửa");
    });

    test("chốt chặn bảo vệ: chặn sửa khi công thức đã được duyệt công khai (EC: 4)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 10,
        isPublic: true,
        approvalStatus: "Approved",
      });
      const res = await recipeService.updateRecipe(101, { id: 10 }, {});
      expect(res.EC).toBe(4);
      expect(res.EM).toContain("đã được duyệt công khai lên hệ thống, bạn không có quyền chỉnh sửa");
    });
  });

  describe("deleteRecipe (UC-11 - Xóa công thức cá nhân)", () => {
    test("thành công: xóa mềm công thức riêng tư (EC: 0)", async () => {
      const mockUpdate = jest.fn().mockResolvedValue(true);
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 10,
        isPublic: false,
        update: mockUpdate,
      });

      const res = await recipeService.deleteRecipe(101, { id: 10 });
      expect(res.EC).toBe(0);
      expect(res.EM).toBe("Đã xóa công thức thành công!");
      expect(mockUpdate).toHaveBeenCalledWith({ isDeleted: true });
    });

    test("thất bại: thiếu userId hoặc chưa đăng nhập (EC: 5)", async () => {
      const res = await recipeService.deleteRecipe(101, null);
      expect(res.EC).toBe(5);
    });

    test("thất bại: ID công thức không hợp lệ hoặc âm (EC: 1)", async () => {
      const res = await recipeService.deleteRecipe(-5, { id: 10 });
      expect(res.EC).toBe(1);
    });

    test("thất bại: không tìm thấy công thức cần xoá (EC: 3)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);
      const res = await recipeService.deleteRecipe(999, { id: 10 });
      expect(res.EC).toBe(3);
    });

    test("thất bại: người dùng không phải là tác giả của công thức (EC: 4)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 99,
        isPublic: false,
      });
      const res = await recipeService.deleteRecipe(101, { id: 10 });
      expect(res.EC).toBe(4);
      expect(res.EM).toContain("Bạn không có quyền xóa công thức này");
    });

    test("thất bại: cố tình xóa công thức đã công khai lên hệ thống (EC: 4)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 10,
        isPublic: true,
      });
      const res = await recipeService.deleteRecipe(101, { id: 10 });
      expect(res.EC).toBe(4);
      expect(res.EM).toBe("Công thức đã công khai thuộc hệ thống, bạn không có quyền xóa!");
    });

    test("thất bại: lỗi kết nối máy chủ CSDL (EC: -1)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockRejectedValue(new Error("DB Error"));
      const res = await recipeService.deleteRecipe(101, { id: 10 });
      expect(res.EC).toBe(-1);
    });
  });

  describe("createRecipe (UC-08 - Người dùng tạo công thức mới)", () => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
    };

    beforeEach(() => {
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTransaction);
      jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
      jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(null);
      jest.spyOn(db.Unit, "findByPk").mockResolvedValue(null);
      jest.spyOn(db.RecipeCategory, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(db.RecipeIngredient, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(db.CookingStep, "bulkCreate").mockResolvedValue([]);
    });

    const validRecipeData = {
      title: "Canh chua cá lóc",
      description: "Món canh chua đậm đà miền Tây",
      thumbnailUrl: "https://example.com/canhchua.jpg",
      cookTimeMinutes: 35,
      difficulty: "Medium",
      defaultServings: 4,
      isPublic: false,
      categories: [1],
      ingredients: [
        {
          customIngredientName: "Cá lóc",
          quantity: 500,
          customUnit: "gam",
        },
      ],
      steps: [
        { stepNumber: 1, instruction: "Sơ chế cá lóc sạch sẽ" },
        { stepNumber: 2, instruction: "Nấu nước sôi và cho cá vào" },
      ],
    };

    test("thành công: tạo công thức riêng tư với DB Transaction (EC: 0)", async () => {
      jest.spyOn(db.Recipe, "create").mockResolvedValue({
        id: 105,
        approvalStatus: "Approved",
      });

      const res = await recipeService.createRecipe({ id: 10, role: "User" }, validRecipeData);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Tạo công thức riêng tư thành công");
      expect(res.DT.recipeId).toBe(105);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test("thành công: tạo công thức công khai thì trạng thái chuyển thành Pending chờ duyệt (EC: 0)", async () => {
      jest.spyOn(db.Recipe, "create").mockResolvedValue({
        id: 106,
        approvalStatus: "Pending",
      });

      const res = await recipeService.createRecipe(
        { id: 10, role: "User" },
        { ...validRecipeData, isPublic: true }
      );

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Đang chờ phê duyệt");
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test("chấp nhận quantity = 0 cho nguyên liệu tự nhập và nguyên liệu chuẩn có mặc định vừa đủ", async () => {
      jest.spyOn(db.Ingredient, "findByPk").mockResolvedValue({
        id: 2,
        ingredientName: "Muối",
        defaultUnitId: 23,
        defaultUnit: { id: 23, unitName: "vừa đủ" },
      });
      db.Unit.findByPk.mockResolvedValue({ id: 23, unitName: "vừa đủ" });
      jest.spyOn(db.Recipe, "create").mockResolvedValue({ id: 107, approvalStatus: "Approved" });

      const res = await recipeService.createRecipe({ id: 10, role: "User" }, {
        ...validRecipeData,
        ingredients: [
          { customIngredientName: "Tiêu", quantity: 0, customUnit: "Vừa Đủ" },
          { ingredientId: 2, quantity: 0 },
          { ingredientId: 2, quantity: 0, unitId: 23 },
        ],
      });

      expect(res.EC).toBe(0);
      const saved = db.RecipeIngredient.bulkCreate.mock.calls[0][0];
      expect(saved[0]).toMatchObject({ quantity: 0, customUnit: "Vừa Đủ" });
      expect(saved[1]).toMatchObject({ ingredientId: 2, quantity: 0, unitId: 23, customUnit: null });
      expect(saved[2]).toMatchObject({ ingredientId: 2, quantity: 0, unitId: 23, customUnit: null });
    });

    test("từ chối quantity = 0 với đơn vị định lượng", async () => {
      const res = await recipeService.createRecipe({ id: 10, role: "User" }, {
        ...validRecipeData,
        ingredients: [{ customIngredientName: "Cá lóc", quantity: 0, customUnit: "gam" }],
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("chỉ đơn vị định tính mới được dùng 0");
      expect(db.RecipeIngredient.bulkCreate).not.toHaveBeenCalled();
    });

    test("từ chối đơn vị tự nhập cho nguyên liệu chuẩn", async () => {
      jest.spyOn(db.Ingredient, "findByPk").mockResolvedValue({
        id: 8, ingredientName: "Cà chua", defaultUnitId: 1,
        defaultUnit: { id: 1, unitName: "gam" },
      });
      const res = await recipeService.createRecipe({ id: 10, role: "User" }, {
        ...validRecipeData,
        ingredients: [{ ingredientId: 8, quantity: 3, customUnit: "trái to" }],
      });
      expect(res.EC).toBe(1);
      expect(res.EM).toContain("chỉ được sử dụng đơn vị đo mặc định");
      expect(db.RecipeIngredient.bulkCreate).not.toHaveBeenCalled();
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    });

    test("thất bại: thiếu thông tin xác thực user (EC: 5)", async () => {
      const res = await recipeService.createRecipe(null, validRecipeData);
      expect(res.EC).toBe(5);
    });

    test("thất bại: thiếu nguyên liệu hoặc thiếu các bước làm (EC: 1)", async () => {
      const resNoIng = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, ingredients: [] }
      );
      expect(resNoIng.EC).toBe(1);
      expect(resNoIng.EM).toContain("nguyên liệu và 1 bước làm");

      const resNoSteps = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, steps: [] }
      );
      expect(resNoSteps.EC).toBe(1);
      expect(resNoSteps.EM).toContain("nguyên liệu và 1 bước làm");
    });

    test("thất bại: tiêu đề hoặc mô tả bị để trống (EC: 1)", async () => {
      const resNoTitle = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, title: "   " }
      );
      expect(resNoTitle.EC).toBe(1);
      expect(resNoTitle.EM).toContain("Tiêu đề");

      const resNoDesc = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, description: "" }
      );
      expect(resNoDesc.EC).toBe(1);
      expect(resNoDesc.EM).toContain("Mô tả");
    });

    test("thất bại: thời gian nấu hoặc độ khó không hợp lệ (EC: 1)", async () => {
      const resBadTime = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, cookTimeMinutes: -5 }
      );
      expect(resBadTime.EC).toBe(1);
      expect(resBadTime.EM).toContain("Thời gian nấu");

      const resBadDiff = await recipeService.createRecipe(
        { id: 10 },
        { ...validRecipeData, difficulty: "Extreme" }
      );
      expect(resBadDiff.EC).toBe(1);
      expect(resBadDiff.EM).toContain("Độ khó");
    });

    test("giao dịch toàn vẹn: tự động rollback khi gặp lỗi CSDL trong transaction (EC: -1)", async () => {
      jest.spyOn(db.Recipe, "create").mockRejectedValue(new Error("Database crash"));

      const res = await recipeService.createRecipe({ id: 10 }, validRecipeData);

      expect(res.EC).toBe(-1);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe("getMyRecipes (UC-09 - Quản lý công thức của tôi)", () => {
    test("thành công: trả về danh sách phân trang công thức cá nhân (EC: 0)", async () => {
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

      const res = await recipeService.getMyRecipes({ id: 10 }, { page: 1, limit: 10 });

      expect(res.EC).toBe(0);
      expect(res.EM).toBe("Thành công!");
      expect(res.DT.page).toBe(1);
      expect(res.DT.limit).toBe(10);
      expect(res.DT.total).toBe(1);
      expect(res.DT.totalPages).toBe(1);
      expect(res.DT.items).toHaveLength(1);
      expect(res.DT.items[0].recipeId).toBe(105);
    });

    test("thất bại: thiếu thông tin xác thực user (EC: 5)", async () => {
      const res = await recipeService.getMyRecipes(null);
      expect(res.EC).toBe(5);
    });

    test("thất bại: page hoặc limit không hợp lệ (EC: 1)", async () => {
      const resBadPage = await recipeService.getMyRecipes({ id: 10 }, { page: 0 });
      expect(resBadPage.EC).toBe(1);
      expect(resBadPage.EM).toContain("Tham số phân trang");

      const resBadLimit = await recipeService.getMyRecipes({ id: 10 }, { limit: "abc" });
      expect(resBadLimit.EC).toBe(1);
      expect(resBadLimit.EM).toContain("Tham số phân trang");
    });

    test("thất bại: lỗi kết nối CSDL (EC: -1)", async () => {
      jest.spyOn(db.Recipe, "findAndCountAll").mockRejectedValue(new Error("DB Error"));
      const res = await recipeService.getMyRecipes({ id: 10 });
      expect(res.EC).toBe(-1);
    });
  });
});

describe.each([
  ["createRecipe", false, { id: 10, role: "User" }],
  ["updateRecipe", true, { id: 10, role: "User" }],
])("%s: đơn vị mặc định của nguyên liệu hệ thống", (method, isUpdate, user) => {
  let invoke;
  let recipeUpdate;
  beforeEach(() => {
    recipeUpdate = jest.fn();
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
      id: 105, authorId: user.id, author: { role: "User" },
      isPublic: false, approvalStatus: "Approved", update: recipeUpdate,
    });
    jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
    jest.spyOn(db.Ingredient, "findByPk").mockResolvedValue({
      id: 1, ingredientName: "Thịt ba chỉ heo", defaultUnitId: 1,
      defaultUnit: { id: 1, unitName: "g" },
    });
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
    jest.spyOn(db.Recipe, "create").mockResolvedValue({ id: 105, approvalStatus: "Approved" });
    for (const model of [db.RecipeCategory, db.RecipeIngredient, db.CookingStep]) {
      jest.spyOn(model, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(model, "destroy").mockResolvedValue(0);
    }
    invoke = (ingredient) => {
      const data = {
        title: "Thịt kho", description: "Thịt kho gia đình", cookTimeMinutes: 30, difficulty: "Medium",
        defaultServings: 4, isPublic: false, categories: [1],
        ingredients: [{ ingredientId: 1, quantity: 500, ...ingredient }],
        steps: [{ stepNumber: 1, instruction: "Kho thịt" }],
      };
      return isUpdate ? recipeService[method](105, user, data) : recipeService[method](user, data);
    };
  });

  test.each([
    { unitId: 2 }, { unitId: 999 }, { unitId: 0 }, { unitId: -1 },
    { unitId: "abc" }, { unitId: "" }, { unitId: true },
    { customUnit: "g" }, { customUnit: "vừa đủ", quantity: 0 },
    { customUnit: "vừa đủ", quantity: 1 },
    { customUnit: "vừa vừa", quantity: 0 }, { customUnit: "vừa vừa", quantity: 1 },
    { unitId: 1, customUnit: "kg" }, { unitId: 2, customUnit: "g" },
  ])("từ chối đơn vị không hợp lệ %j trước khi ghi DB", async (ingredient) => {
    const result = await invoke(ingredient);
    expect(result).toEqual({
      EC: 1, EM: "Nguyên liệu hệ thống chỉ được sử dụng đơn vị đo mặc định của hệ thống!", DT: null,
    });
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(db.Recipe.create).not.toHaveBeenCalled();
    expect(recipeUpdate).not.toHaveBeenCalled();
    expect(db.RecipeIngredient.bulkCreate).not.toHaveBeenCalled();
    expect(db.RecipeIngredient.destroy).not.toHaveBeenCalled();
  });

  test.each([0, 1])("từ chối unitId vừa đủ có tồn tại khi mặc định là g, quantity = %i", async (quantity) => {
    jest.spyOn(db.Unit, "findByPk").mockResolvedValue({ id: 23, unitName: "vừa đủ" });

    const result = await invoke({ unitId: 23, quantity });

    expect(result).toEqual({
      EC: 1, EM: "Nguyên liệu hệ thống chỉ được sử dụng đơn vị đo mặc định của hệ thống!", DT: null,
    });
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(db.Recipe.create).not.toHaveBeenCalled();
    expect(recipeUpdate).not.toHaveBeenCalled();
    expect(db.RecipeIngredient.bulkCreate).not.toHaveBeenCalled();
    expect(db.RecipeIngredient.destroy).not.toHaveBeenCalled();
  });

  test.each([{}, { unitId: null }, { unitId: 1 }, { unitId: "1" }, { customUnit: " " }])(
    "lưu đơn vị mặc định, giữ nguyên định lượng với %j", async (ingredient) => {
      const result = await invoke(ingredient);
      expect(result.EC).toBe(0);
      expect(db.RecipeIngredient.bulkCreate.mock.calls[0][0][0]).toMatchObject({
        ingredientId: 1, quantity: 500, unitId: 1, customUnit: null,
      });
    },
  );

  test("từ chối quantity = 0 nếu đơn vị mặc định là định lượng", async () => {
    const result = await invoke({ quantity: 0 });
    expect(result.EC).toBe(1);
    expect(result.EM).toContain("chỉ đơn vị định tính mới được dùng 0");
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test("chấp nhận quantity = 0 nếu đơn vị mặc định là định tính", async () => {
    db.Ingredient.findByPk.mockResolvedValue({
      id: 1, defaultUnitId: 23, defaultUnit: { id: 23, unitName: "vừa đủ" },
    });
    const result = await invoke({ quantity: 0 });
    expect(result.EC).toBe(0);
    expect(db.RecipeIngredient.bulkCreate.mock.calls[0][0][0]).toMatchObject({
      ingredientId: 1, quantity: 0, unitId: 23, customUnit: null,
    });
  });
});

describe("đơn vị định tính trong các API sửa công thức", () => {
  const data = {
    title: "Canh rau",
    description: "Canh rau nấu nhanh",
    cookTimeMinutes: 20,
    difficulty: "Easy",
    defaultServings: 2,
    isPublic: false,
    categories: [1],
    ingredients: [
      { customIngredientName: "Muối", quantity: 0, customUnit: "vừa đủ" },
      { ingredientId: 8, quantity: 3, unitId: 1 },
    ],
    steps: [{ stepNumber: 1, instruction: "Nấu canh" }],
  };

  test.each([
    ["cá nhân", "updateRecipe", { id: 10, role: "User" }, { authorId: 10, isPublic: false }],
  ])("chấp nhận quantity = 0 khi sửa công thức %s", async (_label, method, user, recipeFields) => {
    const transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({ id: 105, ...recipeFields, update: jest.fn() });
    jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
    jest.spyOn(db.Ingredient, "findByPk").mockResolvedValue({
      id: 8, ingredientName: "Cà chua", defaultUnitId: 1,
      defaultUnit: { id: 1, unitName: "gam" },
    });
    jest.spyOn(db.RecipeCategory, "destroy").mockResolvedValue(0);
    jest.spyOn(db.RecipeCategory, "bulkCreate").mockResolvedValue([]);
    jest.spyOn(db.RecipeIngredient, "destroy").mockResolvedValue(0);
    jest.spyOn(db.RecipeIngredient, "bulkCreate").mockResolvedValue([]);
    jest.spyOn(db.CookingStep, "destroy").mockResolvedValue(0);
    jest.spyOn(db.CookingStep, "bulkCreate").mockResolvedValue([]);

    const res = await recipeService[method](105, user, data);

    expect(res.EC).toBe(0);
    expect(db.RecipeIngredient.bulkCreate.mock.calls[0][0][0]).toMatchObject({ quantity: 0, customUnit: "vừa đủ" });
    expect(db.RecipeIngredient.bulkCreate.mock.calls[0][0][1]).toMatchObject({
      ingredientId: 8, quantity: 3, unitId: 1, customUnit: null,
    });
    expect(transaction.commit).toHaveBeenCalled();
  });
});

describe.each(["createRecipe", "updateRecipe"])("%s: kiểm tra dữ liệu đầu vào", (method) => {
  const data = {
    title: "Soup", description: "Cook soup", cookTimeMinutes: 20,
    defaultServings: 2, difficulty: "Easy", isPublic: false, categories: [1],
    ingredients: [{ customIngredientName: "Salt", quantity: 1, customUnit: "g" }],
    steps: [{ stepNumber: 1, instruction: "Prepare" }, { stepNumber: 2, instruction: "Cook" }],
  };
  let transaction;
  const call = (body) => method === "updateRecipe"
    ? recipeService[method](105, { id: 10, role: "User" }, body)
    : recipeService[method]({ id: 10, role: "User" }, body);

  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Recipe, "create").mockResolvedValue({ id: 105, approvalStatus: "Approved" });
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
      id: 105, authorId: 10, author: { role: "User" },
      isPublic: false, approvalStatus: "Approved", update: jest.fn(),
    });
    jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
    jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(null);
    jest.spyOn(db.Unit, "findByPk").mockResolvedValue(null);
    for (const model of [db.RecipeCategory, db.RecipeIngredient, db.CookingStep]) {
      jest.spyOn(model, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(model, "destroy").mockResolvedValue(0);
    }
  });

  test.each([
    ["cookTimeMinutes", 1.5], ["cookTimeMinutes", Infinity], ["cookTimeMinutes", true],
    ["defaultServings", 2.5], ["defaultServings", Infinity], ["defaultServings", true],
  ])("từ chối %s = %s trước khi mở giao dịch", async (field, value) => {
    const result = await call({ ...data, [field]: value });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test.each([0, -1, 1.5, null, "", "bad", Infinity, true])("từ chối số thứ tự bước không hợp lệ: %s", async (stepNumber) => {
    const result = await call({ ...data, steps: [{ stepNumber, instruction: "Cook" }] });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test.each([
    [{ stepNumber: 1, instruction: "A" }, { stepNumber: "1", instruction: "B" }],
    [{ stepNumber: 2, instruction: "A" }, { instruction: "B" }],
    [null],
  ])("từ chối số thứ tự bước trùng nhau hoặc bước có giá trị null (%j)", async (...steps) => {
    const result = await call({ ...data, steps });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test("chấp nhận chuỗi số nguyên và tự gán số thứ tự cho bước chưa có", async () => {
    const result = await call({ ...data, cookTimeMinutes: "20", defaultServings: "2",
      steps: [{ stepNumber: "1", instruction: "Prepare" }, { instruction: "Cook" }],
    });
    expect(result.EC).toBe(0);
    expect(db.CookingStep.bulkCreate).toHaveBeenCalledWith([
      { recipeId: 105, stepNumber: 1, instruction: "Prepare" },
      { recipeId: 105, stepNumber: 2, instruction: "Cook" },
    ], { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });

  test("hoàn tác giao dịch khi lưu nguyên liệu lỗi sau khi đã lưu công thức và danh mục", async () => {
    db.RecipeIngredient.bulkCreate.mockRejectedValue(new Error("Ingredient write failed"));
    const result = await call(data);
    expect(result).toMatchObject({ EC: -1, DT: null });
    if (method === "createRecipe") {
      expect(db.Recipe.create).toHaveBeenCalledWith(expect.any(Object), { transaction });
    } else {
      const recipe = await db.Recipe.findOne.mock.results[0].value;
      expect(recipe.update).toHaveBeenCalledWith(expect.any(Object), { transaction });
      expect(db.RecipeIngredient.destroy).toHaveBeenCalledWith({
        where: { recipeId: 105 }, transaction,
      });
    }
    expect(db.RecipeCategory.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.CookingStep.bulkCreate).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test("hoàn tác giao dịch khi lưu bước làm lỗi sau khi đã lưu nguyên liệu", async () => {
    db.CookingStep.bulkCreate.mockRejectedValue(new Error("Step write failed"));
    const result = await call(data);
    expect(result.EC).toBe(-1);
    expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });
});
describe("adminDeleteRecipe (UC-19)", () => {
  test("thành công: Admin xóa mềm công thức chuẩn do Admin tạo (EC: 0)", async () => {
    const mockRecipe = {
      id: 1,
      author: { id: 1, role: "Admin" },
      isPublic: true,
      update: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(mockRecipe);

    const res = await recipeService.adminDeleteRecipe(1, { id: 1, role: "Admin" });
    expect(res.EC).toBe(0);
    expect(mockRecipe.update).toHaveBeenCalledWith({ isDeleted: true });
    expect(res.EM).toBe("Đã xóa mềm công thức thành công!");
  });

  test("thành công: Admin xóa mềm công thức công khai của người dùng (EC: 0)", async () => {
    const mockRecipe = {
      id: 2,
      author: { id: 10, role: "User" },
      isPublic: true,
      update: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(mockRecipe);

    const res = await recipeService.adminDeleteRecipe(2, { id: 1, role: "Admin" });
    expect(res.EC).toBe(0);
    expect(mockRecipe.update).toHaveBeenCalledWith({ isDeleted: true });
    expect(res.EM).toBe("Đã xóa mềm công thức thành công!");
  });

  test("thất bại: công thức của người dùng đang ở chế độ riêng tư, Admin không thể thao tác (EC: 4)", async () => {
    const mockRecipe = {
      id: 3,
      author: { id: 10, role: "User" },
      isPublic: false,
      update: jest.fn(),
    };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(mockRecipe);

    const res = await recipeService.adminDeleteRecipe(3, { id: 1, role: "Admin" });
    expect(res.EC).toBe(4);
    expect(mockRecipe.update).not.toHaveBeenCalled();
    expect(res.EM).toContain("Công thức này đang ở chế độ riêng tư của người dùng");
  });

  test("thất bại: ID công thức không hợp lệ (EC: 1)", async () => {
    const res = await recipeService.adminDeleteRecipe("abc", { id: 1, role: "Admin" });
    expect(res.EC).toBe(1);
  });

  test("thất bại: không tìm thấy công thức cần xoá (EC: 3)", async () => {
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);
    const res = await recipeService.adminDeleteRecipe(999, { id: 1, role: "Admin" });
    expect(res.EC).toBe(3);
  });
});

describe("moderateRecipe: bảo vệ công thức đã duyệt", () => {
  let transaction;
  beforeEach(() => {
    transaction = { LOCK: { UPDATE: "UPDATE" }, commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockImplementation(async (callback) => {
      try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  });

  test.each(["Rejected", "rejected"])("chặn từ chối bằng trạng thái %s", async (action) => {
    const recipe = {
      id: 105, isPublic: true, approvalStatus: "Approved", update: jest.fn(),
    };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(recipe);

    const result = await recipeService.moderateRecipe(105, {
      action, rejectionReason: "Lý do từ chối",
    });

    expect(result).toEqual({
      EC: 1, EM: "Không thể từ chối công thức đã được phê duyệt!", DT: null,
    });
    expect(recipe.update).not.toHaveBeenCalled();
  });

  test("vẫn cho phép từ chối công thức đang chờ duyệt", async () => {
    const recipe = {
      id: 105, isPublic: true, approvalStatus: "Pending", update: jest.fn(),
    };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(recipe);

    const result = await recipeService.moderateRecipe(105, {
      action: "Rejected", rejectionReason: "  Nội dung chưa phù hợp  ",
    });

    expect(result.EC).toBe(0);
    expect(recipe.update).toHaveBeenCalledWith({
      approvalStatus: "Rejected", rejectionReason: "Nội dung chưa phù hợp", isPublic: false,
    }, { transaction });
    expect(result.DT.rejectionReason).toBe("Nội dung chưa phù hợp");
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });

  test.each([0, -1, 1.5, "1.5", "abc", true, null, [], {}, Infinity, 9007199254740992])(
    "từ chối ID không phải số nguyên dương an toàn: %j", async (id) => {
      expect((await recipeService.moderateRecipe(id, { approvalStatus: "Approved" })).EC).toBe(1);
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    },
  );

  test.each([null, [], "Approved", 1])("từ chối body không phải object: %j", async (body) => {
    expect((await recipeService.moderateRecipe(105, body)).EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test.each([undefined, null, 1, true, {}, ["Approved"], "Pending", ""])(
    "từ chối trạng thái sai kiểu hoặc sai giá trị: %j", async (approvalStatus) => {
      expect((await recipeService.moderateRecipe(105, { approvalStatus })).EC).toBe(1);
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    },
  );

  test.each([undefined, null, "", "  ", 123, true, {}, ["reason"]])(
    "từ chối lý do không phải chuỗi không rỗng: %j", async (rejectionReason) => {
      expect((await recipeService.moderateRecipe(105, { approvalStatus: "Rejected", rejectionReason })).EC).toBe(1);
      expect(db.sequelize.transaction).not.toHaveBeenCalled();
    },
  );

  test.each([null, { id: 105, isPublic: false, approvalStatus: "Pending" },
    { id: 105, isPublic: true, approvalStatus: "Rejected" },
    { id: 105, isPublic: true, approvalStatus: "Unknown" }])(
    "không duyệt bài không tồn tại hoặc không còn chờ duyệt: %j", async (recipe) => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(recipe);
      const result = await recipeService.moderateRecipe(105, { approvalStatus: "Approved" });
      expect(result.EC).toBe(recipe ? 1 : 3);
    },
  );

  const mockApproval = (role = "User") => {
    const recipe = { id: 105, isPublic: true, approvalStatus: "Pending", update: jest.fn() };
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue(recipe);
    jest.spyOn(db.Recipe, "findByPk").mockResolvedValue({ id: 105, author: { role } });
    jest.spyOn(db.Category, "findOne").mockResolvedValue({ id: 8 });
    jest.spyOn(db.RecipeCategory, "findOrCreate").mockResolvedValue([{}, true]);
    return recipe;
  };

  test.each(["User", "Admin"])("duyệt công thức của %s và commit trước khi trả thành công", async (role) => {
    const recipe = mockApproval(role);
    const result = await recipeService.moderateRecipe("105", { approvalStatus: "Approved" });
    expect(result.EC).toBe(0);
    expect(db.Recipe.findOne).toHaveBeenCalledWith({
      where: { id: 105, isDeleted: false }, transaction, lock: transaction.LOCK.UPDATE,
    });
    expect(recipe.update).toHaveBeenCalledWith({
      approvalStatus: "Approved", rejectionReason: null, isPublic: true,
    }, { transaction });
    if (role === "User") {
      expect(db.RecipeCategory.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({ transaction }));
    } else {
      expect(db.RecipeCategory.findOrCreate).not.toHaveBeenCalled();
    }
    expect(transaction.commit).toHaveBeenCalledTimes(1);
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  test("hoàn tác và trả lỗi khi gắn danh mục thất bại", async () => {
    mockApproval();
    jest.spyOn(db.RecipeCategory, "findOrCreate").mockRejectedValue(new Error("Category write failed"));
    const result = await recipeService.moderateRecipe(105, { approvalStatus: "Approved" });
    expect(result.EC).toBe(-1);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test("hoàn tác khi cập nhật trạng thái thất bại", async () => {
    const recipe = mockApproval();
    recipe.update.mockRejectedValue(new Error("Recipe write failed"));
    expect((await recipeService.moderateRecipe(105, { approvalStatus: "Approved" })).EC).toBe(-1);
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(db.RecipeCategory.findOrCreate).not.toHaveBeenCalled();
  });

  test.each(["Approved", "Rejected"])("không ghi đè kết quả %s của lần kiểm duyệt trước", async (status) => {
    const recipe = mockApproval("Admin");
    recipe.update.mockImplementation(async (values) => Object.assign(recipe, values));
    const first = await recipeService.moderateRecipe(105, {
      approvalStatus: status, rejectionReason: "Nội dung chưa phù hợp",
    });
    const second = await recipeService.moderateRecipe(105, {
      approvalStatus: status === "Approved" ? "Rejected" : "Approved",
      rejectionReason: "Quyết định khác",
    });
    expect(first.EC).toBe(0);
    expect(second.EC).toBe(1);
    expect(recipe.approvalStatus).toBe(status);
    expect(recipe.update).toHaveBeenCalledTimes(1);
  });
});

describe.each(["adminCreateRecipe", "adminUpdateRecipe"])("%s: kiểm tra dữ liệu đầu vào", (method) => {
  const data = {
    title: "Soup", description: "Cook soup", cookTimeMinutes: 20,
    defaultServings: 2, difficulty: "Easy", isPublic: false, categories: [1],
    ingredients: [{ customIngredientName: "Salt", quantity: 1, customUnit: "g" }],
    steps: [{ stepNumber: 1, instruction: "Prepare" }, { stepNumber: 2, instruction: "Cook" }],
  };
  let transaction;
  const call = (body) => method === "adminUpdateRecipe"
    ? recipeService[method](105, { id: 10, role: "Admin" }, body)
    : recipeService[method]({ id: 10, role: "Admin" }, body);

  beforeEach(() => {
    transaction = { commit: jest.fn(), rollback: jest.fn() };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(transaction);
    jest.spyOn(db.Recipe, "create").mockResolvedValue({ id: 105, approvalStatus: "Approved" });
    jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
      id: 105, authorId: 10, author: { role: "Admin" },
      isPublic: method === "adminUpdateRecipe", approvalStatus: "Approved", update: jest.fn(),
    });
    jest.spyOn(db.Category, "findAll").mockResolvedValue([{ id: 1 }]);
    jest.spyOn(db.Ingredient, "findOne").mockResolvedValue(null);
    jest.spyOn(db.Unit, "findByPk").mockResolvedValue(null);
    for (const model of [db.RecipeCategory, db.RecipeIngredient, db.CookingStep]) {
      jest.spyOn(model, "bulkCreate").mockResolvedValue([]);
      jest.spyOn(model, "destroy").mockResolvedValue(0);
    }
  });

  test.each([
    ["cookTimeMinutes", 1.5], ["cookTimeMinutes", Infinity], ["cookTimeMinutes", true],
    ["defaultServings", 2.5], ["defaultServings", Infinity], ["defaultServings", true],
  ])("từ chối %s = %s trước khi mở giao dịch", async (field, value) => {
    const result = await call({ ...data, [field]: value });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test.each([0, -1, 1.5, null, "", "bad", Infinity, true])("từ chối số thứ tự bước không hợp lệ: %s", async (stepNumber) => {
    const result = await call({ ...data, steps: [{ stepNumber, instruction: "Cook" }] });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test.each([
    [{ stepNumber: 1, instruction: "A" }, { stepNumber: "1", instruction: "B" }],
    [{ stepNumber: 2, instruction: "A" }, { instruction: "B" }],
    [null],
  ])("từ chối số thứ tự bước trùng nhau hoặc bước có giá trị null (%j)", async (...steps) => {
    const result = await call({ ...data, steps });
    expect(result.EC).toBe(1);
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
  });

  test("chấp nhận chuỗi số nguyên và tự gán số thứ tự cho bước chưa có", async () => {
    const result = await call({ ...data, cookTimeMinutes: "20", defaultServings: "2",
      steps: [{ stepNumber: "1", instruction: "Prepare" }, { instruction: "Cook" }],
    });
    expect(result.EC).toBe(0);
    expect(db.CookingStep.bulkCreate).toHaveBeenCalledWith([
      { recipeId: 105, stepNumber: 1, instruction: "Prepare" },
      { recipeId: 105, stepNumber: 2, instruction: "Cook" },
    ], { transaction });
    expect(transaction.commit).toHaveBeenCalledTimes(1);
  });

  test("hoàn tác giao dịch khi lưu nguyên liệu lỗi sau khi đã lưu công thức và danh mục", async () => {
    db.RecipeIngredient.bulkCreate.mockRejectedValue(new Error("Ingredient write failed"));
    const result = await call(data);
    expect(result).toMatchObject({ EC: -1, DT: null });
    if (method === "adminCreateRecipe") {
      expect(db.Recipe.create).toHaveBeenCalledWith(expect.any(Object), { transaction });
    } else {
      const recipe = await db.Recipe.findOne.mock.results[0].value;
      expect(recipe.update).toHaveBeenCalledWith(expect.any(Object), { transaction });
      expect(db.RecipeIngredient.destroy).toHaveBeenCalledWith({
        where: { recipeId: 105 }, transaction,
      });
    }
    expect(db.RecipeCategory.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(db.CookingStep.bulkCreate).not.toHaveBeenCalled();
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });

  test("hoàn tác giao dịch khi lưu bước làm lỗi sau khi đã lưu nguyên liệu", async () => {
    db.CookingStep.bulkCreate.mockRejectedValue(new Error("Step write failed"));
    const result = await call(data);
    expect(result.EC).toBe(-1);
    expect(db.RecipeIngredient.bulkCreate).toHaveBeenCalledWith(expect.any(Array), { transaction });
    expect(transaction.rollback).toHaveBeenCalledTimes(1);
    expect(transaction.commit).not.toHaveBeenCalled();
  });
});

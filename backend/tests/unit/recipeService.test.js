import recipeService from "../../src/services/recipeService";
import db from "../../src/models/index";

describe("RecipeService Unit Tests", () => {
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

      // Admin gọi vào -> cho phép
      const resAdmin = await recipeService.scaleRecipeIngredients(101, { servings: 4 }, 99, "Admin");
      expect(resAdmin.EC).toBe(0);
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
        pendingUpdateData: null,
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

    test("bảo mật: bài viết riêng tư chỉ hiển thị với chính tác giả hoặc Admin (EC: 3)", async () => {
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
});

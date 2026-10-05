import favoriteService from "../../src/services/favoriteService";
import db from "../../src/models/index";

describe("FavoriteService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each(["addFavorite", "updateFavoriteNote", "removeFavorite"])(
    "%s: validation recipeId",
    (method) => {
      test.each([
        "101abc",
        "101.5",
        "1e2",
        "0x65",
        "",
        " 101 ",
        "0",
        "-1",
        "2147483648",
        "9007199254740993",
        101.5,
        null,
        undefined,
        true,
        [],
        [101],
        {},
      ])(
        "từ chối ID không hợp lệ %p trước khi truy vấn DB",
        async (recipeId) => {
          const recipeLookup = jest.spyOn(db.Recipe, "findOne");
          const favoriteLookup = jest.spyOn(db.FavoriteRecipe, "findOne");

          const res = await favoriteService[method](10, recipeId, "Ghi chú");

          expect(res.EC).toBe(1);
          expect(res.EM).toBe("ID món ăn không hợp lệ!");
          expect(recipeLookup).not.toHaveBeenCalled();
          expect(favoriteLookup).not.toHaveBeenCalled();
        },
      );

      test("chấp nhận ID nguyên dương ở dạng chuỗi", async () => {
        const recipeLookup = jest
          .spyOn(db.Recipe, "findOne")
          .mockResolvedValue(null);
        const favoriteLookup = jest
          .spyOn(db.FavoriteRecipe, "findOne")
          .mockResolvedValue(null);

        const res = await favoriteService[method](10, "101", "Ghi chú");

        expect(res.EC).toBe(3);
        const lookup = method === "addFavorite" ? recipeLookup : favoriteLookup;
        const idField = method === "addFavorite" ? "id" : "recipeId";
        expect(lookup).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ [idField]: 101 }),
          }),
        );
      });
    },
  );

  describe("getUserFavorites (UC-12)", () => {
    test("thành công: lấy danh sách món yêu thích kèm phân trang và thông tin món ăn (EC: 0)", async () => {
      const mockFavorites = [
        {
          userId: 10,
          recipeId: 101,
          personalNotes: "Nêm ớt vừa tay, nấu cho gia đình vào cuối tuần.",
          createdAt: "2026-08-22T08:30:00.000Z",
          recipe: {
            id: 101,
            title: "Bò lúc lắc",
            thumbnailUrl: "https://cloudinary.com/bo.jpg",
            cookTimeMinutes: 25,
            difficulty: "Easy",
            author: {
              id: 5,
              username: "Chef Tuan",
            },
          },
        },
      ];

      jest.spyOn(db.FavoriteRecipe, "findAndCountAll").mockResolvedValue({
        count: 1,
        rows: mockFavorites,
      });

      const res = await favoriteService.getUserFavorites(10, {
        page: 1,
        limit: 10,
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Thành công");
      expect(res.DT.page).toBe(1);
      expect(res.DT.limit).toBe(10);
      expect(res.DT.total).toBe(1);
      expect(res.DT.totalPages).toBe(1);
      expect(Array.isArray(res.DT.items)).toBe(true);
      expect(res.DT.items).toHaveLength(1);
      expect(res.DT.items[0].recipeId).toBe(101);
      expect(res.DT.items[0].title).toBe("Bò lúc lắc");
      expect(res.DT.items[0].author.username).toBe("Chef Tuan");
      expect(res.DT.items[0].personalNotes).toBe(
        "Nêm ớt vừa tay, nấu cho gia đình vào cuối tuần.",
      );
      expect(res.DT.items[0].createdAt).toBe("2026-08-22T08:30:00.000Z");
    });

    test("thành công: người dùng chưa có món yêu thích nào trả về items rỗng (EC: 0)", async () => {
      jest.spyOn(db.FavoriteRecipe, "findAndCountAll").mockResolvedValue({
        count: 0,
        rows: [],
      });

      const res = await favoriteService.getUserFavorites(10);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("Thành công");
      expect(res.DT.total).toBe(0);
      expect(res.DT.items).toEqual([]);
    });

    test("thất bại: tham số phân trang page không hợp lệ (EC: 1)", async () => {
      const res = await favoriteService.getUserFavorites(10, { page: -1 });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain(
        "Tham số phân trang page hoặc limit không hợp lệ",
      );
      expect(res.DT).toBeNull();
    });

    test("thất bại: tham số phân trang limit không phải số nguyên dương (EC: 1)", async () => {
      const res = await favoriteService.getUserFavorites(10, {
        limit: "invalid",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain(
        "Tham số phân trang page hoặc limit không hợp lệ",
      );
      expect(res.DT).toBeNull();
    });

    test("thất bại: thiếu userId hoặc chưa đăng nhập (EC: 5)", async () => {
      const res = await favoriteService.getUserFavorites(null);

      expect(res.EC).toBe(5);
      expect(res.EM).toContain("Chưa xác thực");
      expect(res.DT).toBeNull();
    });

    test("thất bại: lỗi kết nối cơ sở dữ liệu (EC: -1)", async () => {
      jest
        .spyOn(db.FavoriteRecipe, "findAndCountAll")
        .mockRejectedValue(new Error("Database connection error"));

      const res = await favoriteService.getUserFavorites(10);

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
      expect(res.DT).toBeNull();
    });
  });

  describe("addFavorite (UC-12)", () => {
    test("thành công: thêm món ăn vào bộ sưu tập yêu thích (EC: 0, DT: null)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 2,
        approvalStatus: "Approved",
        isPublic: true,
        isDeleted: false,
      });
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(null);
      jest.spyOn(db.FavoriteRecipe, "create").mockResolvedValue({
        userId: 10,
        recipeId: 101,
        personalNotes: "Thử nấu vào cuối tuần",
      });

      const res = await favoriteService.addFavorite(
        10,
        101,
        "Thử nấu vào cuối tuần",
      );

      expect(res.EC).toBe(0);
      expect(res.EM).toBe("Đã thêm vào bộ sưu tập yêu thích!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: chưa xác thực hoặc thiếu userId (EC: 5)", async () => {
      const res = await favoriteService.addFavorite(null, 101);

      expect(res.EC).toBe(5);
      expect(res.EM).toContain("Chưa xác thực");
      expect(res.DT).toBeNull();
    });

    test("thất bại: ID món ăn không hợp lệ hoặc âm (EC: 1)", async () => {
      const res = await favoriteService.addFavorite(10, "abc");

      expect(res.EC).toBe(1);
      expect(res.EM).toBe("ID món ăn không hợp lệ!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: ghi chú cá nhân vượt quá 500 ký tự (EC: 1)", async () => {
      const longNote = "a".repeat(501);
      const res = await favoriteService.addFavorite(10, 101, longNote);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được vượt quá 500 ký tự");
      expect(res.DT).toBeNull();
    });

    test("thất bại: không tìm thấy món ăn để thêm vào yêu thích (EC: 3)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue(null);

      const res = await favoriteService.addFavorite(10, 999);

      expect(res.EC).toBe(3);
      expect(res.EM).toBe("Không tìm thấy món ăn để thêm vào yêu thích!");
      expect(res.DT).toBeNull();
    });

    test("bảo mật: bài viết riêng tư của người khác bị chặn không tìm thấy (EC: 3)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 102,
        authorId: 99,
        approvalStatus: "Approved",
        isPublic: false,
        isDeleted: false,
      });

      const res = await favoriteService.addFavorite(10, 102);

      expect(res.EC).toBe(3);
      expect(res.EM).toBe("Không tìm thấy món ăn để thêm vào yêu thích!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: món ăn đã tồn tại trong danh sách yêu thích (EC: 2)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 2,
        approvalStatus: "Approved",
        isPublic: true,
        isDeleted: false,
      });
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue({
        userId: 10,
        recipeId: 101,
      });

      const res = await favoriteService.addFavorite(10, 101);

      expect(res.EC).toBe(2);
      expect(res.EM).toBe("Món ăn này đã tồn tại trong danh sách yêu thích!");
      expect(res.DT).toBeNull();
    });

    test("trả EC: 2 khi DB chặn thêm trùng sau bước kiểm tra tồn tại", async () => {
      jest.spyOn(db.Recipe, "findOne").mockResolvedValue({
        id: 101,
        authorId: 2,
        approvalStatus: "Approved",
        isPublic: true,
      });
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(null);
      jest
        .spyOn(db.FavoriteRecipe, "create")
        .mockRejectedValue(
          new db.Sequelize.UniqueConstraintError({
            message: "Duplicate favorite",
          }),
        );

      const res = await favoriteService.addFavorite(10, 101);

      expect(db.FavoriteRecipe.create).toHaveBeenCalled();
      expect(res).toEqual({
        EC: 2,
        EM: "Món ăn này đã tồn tại trong danh sách yêu thích!",
        DT: null,
      });
    });

    test("thất bại: lỗi kết nối máy chủ CSDL (EC: -1)", async () => {
      jest.spyOn(db.Recipe, "findOne").mockRejectedValue(new Error("DB error"));

      const res = await favoriteService.addFavorite(10, 101);

      expect(res.EC).toBe(-1);
      expect(res.EM).toBe("Lỗi kết nối máy chủ!");
      expect(res.DT).toBeNull();
    });
  });

  describe("updateFavoriteNote (UC-12)", () => {
    test("thành công: cập nhật ghi chú thành công (EC: 0, DT: null)", async () => {
      const mockFavorite = {
        userId: 10,
        recipeId: 101,
        personalNotes: "Ghi chú cũ",
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(mockFavorite);

      const res = await favoriteService.updateFavoriteNote(
        10,
        101,
        "Nấu ít ớt lại",
      );

      expect(res.EC).toBe(0);
      expect(res.EM).toBe("Cập nhật ghi chú thành công!");
      expect(res.DT).toBeNull();
      expect(mockFavorite.update).toHaveBeenCalledWith({
        personalNotes: "Nấu ít ớt lại",
      });
    });

    test("thất bại: chưa xác thực hoặc thiếu userId (EC: 5)", async () => {
      const res = await favoriteService.updateFavoriteNote(
        null,
        101,
        "Nấu ít ớt",
      );

      expect(res.EC).toBe(5);
      expect(res.EM).toContain("Chưa xác thực");
      expect(res.DT).toBeNull();
    });

    test("thất bại: ID món ăn không hợp lệ hoặc âm (EC: 1)", async () => {
      const res = await favoriteService.updateFavoriteNote(
        10,
        "invalid-id",
        "Nấu ít ớt",
      );

      expect(res.EC).toBe(1);
      expect(res.EM).toBe("ID món ăn không hợp lệ!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: thiếu trường personalNotes (EC: 1)", async () => {
      const res = await favoriteService.updateFavoriteNote(10, 101, null);

      expect(res.EC).toBe(1);
      expect(res.EM).toBe("Vui lòng nhập nội dung ghi chú!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: ghi chú cá nhân vượt quá 500 ký tự (EC: 1)", async () => {
      const longNote = "a".repeat(501);
      const res = await favoriteService.updateFavoriteNote(10, 101, longNote);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được vượt quá 500 ký tự");
      expect(res.DT).toBeNull();
    });

    test("thất bại: món ăn chưa có trong danh sách yêu thích (EC: 3)", async () => {
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(null);

      const res = await favoriteService.updateFavoriteNote(
        10,
        101,
        "Nấu ít ớt",
      );

      expect(res.EC).toBe(3);
      expect(res.EM).toBe("Món ăn chưa có trong danh sách yêu thích của bạn!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: lỗi kết nối máy chủ CSDL (EC: -1)", async () => {
      jest
        .spyOn(db.FavoriteRecipe, "findOne")
        .mockRejectedValue(new Error("DB error"));

      const res = await favoriteService.updateFavoriteNote(
        10,
        101,
        "Nấu ít ớt",
      );

      expect(res.EC).toBe(-1);
      expect(res.EM).toBe("Lỗi kết nối máy chủ!");
      expect(res.DT).toBeNull();
    });
  });

  describe("removeFavorite (UC-12)", () => {
    test("thành công: xóa món ăn khỏi danh sách yêu thích thành công (EC: 0, DT: null)", async () => {
      const mockFavorite = {
        userId: 10,
        recipeId: 101,
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(mockFavorite);

      const res = await favoriteService.removeFavorite(10, 101);

      expect(res.EC).toBe(0);
      expect(res.EM).toBe("Đã xóa khỏi danh sách yêu thích!");
      expect(res.DT).toBeNull();
      expect(mockFavorite.destroy).toHaveBeenCalled();
    });

    test("thất bại: chưa xác thực hoặc thiếu userId (EC: 5)", async () => {
      const res = await favoriteService.removeFavorite(null, 101);

      expect(res.EC).toBe(5);
      expect(res.EM).toContain("Chưa xác thực");
      expect(res.DT).toBeNull();
    });

    test("thất bại: ID món ăn không hợp lệ hoặc âm (EC: 1)", async () => {
      const res = await favoriteService.removeFavorite(10, "not-a-number");

      expect(res.EC).toBe(1);
      expect(res.EM).toBe("ID món ăn không hợp lệ!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: món ăn chưa có trong danh sách yêu thích (EC: 3)", async () => {
      jest.spyOn(db.FavoriteRecipe, "findOne").mockResolvedValue(null);

      const res = await favoriteService.removeFavorite(10, 101);

      expect(res.EC).toBe(3);
      expect(res.EM).toBe("Món ăn chưa có trong danh sách yêu thích của bạn!");
      expect(res.DT).toBeNull();
    });

    test("thất bại: lỗi kết nối máy chủ CSDL (EC: -1)", async () => {
      jest
        .spyOn(db.FavoriteRecipe, "findOne")
        .mockRejectedValue(new Error("DB error"));

      const res = await favoriteService.removeFavorite(10, 101);

      expect(res.EC).toBe(-1);
      expect(res.EM).toBe("Lỗi kết nối máy chủ!");
      expect(res.DT).toBeNull();
    });
  });
});

import db from "../models/index";

/**
 * Service quản lý danh sách món ăn yêu thích và ghi chú nấu nướng (UC-12)
 */

// Lấy danh sách món yêu thích của người dùng
const getFavorites = async (user) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const favorites = await db.FavoriteRecipe.findAll({
      where: { userId },
      include: [
        {
          model: db.Recipe,
          as: "recipe",
          where: { isDeleted: false },
          required: false,
          attributes: [
            "id",
            "title",
            "description",
            "thumbnailUrl",
            "cookTimeMinutes",
            "difficulty",
            "defaultServings",
            "isPublic",
            "approvalStatus",
          ],
          include: [
            {
              model: db.User,
              as: "author",
              attributes: ["id", "username", "avatarUrl"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = favorites
      .filter((f) => f.recipe)
      .map((f) => ({
        id: `${f.userId}-${f.recipeId}`,
        recipeId: f.recipeId,
        personalNotes: f.personalNotes || "",
        note: f.personalNotes || "",
        createdAt: f.createdAt,
        recipe: {
          id: f.recipe.id,
          _id: f.recipe.id,
          title: f.recipe.title,
          thumbnail: f.recipe.thumbnailUrl,
          thumbnailUrl: f.recipe.thumbnailUrl,
          image: f.recipe.thumbnailUrl,
          cookTimeMinutes: f.recipe.cookTimeMinutes,
          prepTime: f.recipe.cookTimeMinutes,
          difficulty: f.recipe.difficulty,
          defaultServings: f.recipe.defaultServings,
          rating: "4.8",
          author: {
            id: f.recipe.author?.id,
            name: f.recipe.author?.username || "Đầu bếp TasteBook",
            avatar: f.recipe.author?.avatarUrl,
          },
        },
      }));

    return {
      EC: 0,
      EM: "Lấy danh sách món yêu thích thành công!",
      DT: formatted,
    };
  } catch (error) {
    console.error("getFavorites error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// Thêm một công thức vào danh sách yêu thích
const addFavorite = async (user, recipeIdParam, data = {}) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const recipeId = Number(recipeIdParam || data.recipeId);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return {
        EC: 1,
        EM: "Mã công thức không hợp lệ!",
        DT: null,
      };
    }

    // Kiểm tra công thức có tồn tại không
    const recipe = await db.Recipe.findOne({
      where: { id: recipeId, isDeleted: false },
    });
    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức!",
        DT: null,
      };
    }

    const personalNotes =
      data.personalNotes !== undefined ? data.personalNotes : data.note || "";

    // Kiểm tra đã có trong danh sách yêu thích chưa
    const existing = await db.FavoriteRecipe.findOne({
      where: { userId, recipeId },
    });

    if (existing) {
      if (personalNotes) {
        existing.personalNotes = personalNotes;
        await existing.save();
      }
      return {
        EC: 0,
        EM: "Công thức đã có trong danh sách yêu thích!",
        DT: existing,
      };
    }

    const newFav = await db.FavoriteRecipe.create({
      userId,
      recipeId,
      personalNotes,
    });

    return {
      EC: 0,
      EM: "Đã thêm vào danh sách yêu thích!",
      DT: newFav,
    };
  } catch (error) {
    console.error("addFavorite error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// Cập nhật ghi chú cá nhân cho món ăn yêu thích
const updateFavoriteNote = async (user, recipeIdParam, data = {}) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const recipeId = Number(recipeIdParam);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return {
        EC: 1,
        EM: "Mã công thức không hợp lệ!",
        DT: null,
      };
    }

    const existing = await db.FavoriteRecipe.findOne({
      where: { userId, recipeId },
    });

    if (!existing) {
      return {
        EC: 3,
        EM: "Công thức chưa có trong danh sách yêu thích!",
        DT: null,
      };
    }

    const personalNotes =
      data.personalNotes !== undefined ? data.personalNotes : data.note || "";
    existing.personalNotes = personalNotes;
    await existing.save();

    return {
      EC: 0,
      EM: "Cập nhật ghi chú cá nhân thành công!",
      DT: existing,
    };
  } catch (error) {
    console.error("updateFavoriteNote error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// Xóa công thức khỏi danh sách yêu thích
const removeFavorite = async (user, recipeIdParam) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const recipeId = Number(recipeIdParam);
    if (!Number.isInteger(recipeId) || recipeId <= 0) {
      return {
        EC: 1,
        EM: "Mã công thức không hợp lệ!",
        DT: null,
      };
    }

    await db.FavoriteRecipe.destroy({
      where: { userId, recipeId },
    });

    return {
      EC: 0,
      EM: "Đã xóa khỏi danh sách yêu thích!",
      DT: null,
    };
  } catch (error) {
    console.error("removeFavorite error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export default {
  getFavorites,
  addFavorite,
  updateFavoriteNote,
  removeFavorite,
};

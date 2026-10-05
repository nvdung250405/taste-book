import db from "../models/index";

const parseRecipeId = (recipeId) => {
  if (Array.isArray(recipeId) || !/^[0-9]+$/.test(String(recipeId))) return null;
  const id = Number(recipeId);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : null;
};

// 5.1 GET /api/v1/favorites - Lấy danh sách món ăn yêu thích của người dùng kèm phân trang (UC-12)
const getUserFavorites = async (userId, query = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const { page, limit } = query;

    // 1. Phân trang: page & limit
    let pageNumber = 1;
    if (page !== undefined && page !== null && String(page).trim() !== "") {
      pageNumber = Number(page);
      if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
    }

    let limitNumber = 10;
    if (limit !== undefined && limit !== null && String(limit).trim() !== "") {
      limitNumber = Number(limit);
      if (!Number.isInteger(limitNumber) || limitNumber <= 0) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
      if (limitNumber > 100) limitNumber = 100;
    }

    const offset = (pageNumber - 1) * limitNumber;

    // 2. Truy vấn dữ liệu có phân trang kết hợp findAndCountAll
    const { count, rows } = await db.FavoriteRecipe.findAndCountAll({
      where: { userId: Number(userId) },
      include: [
        {
          model: db.Recipe,
          as: "recipe",
          where: { isDeleted: false },
          include: [
            {
              model: db.User,
              as: "author",
              attributes: ["id", "username"],
            },
          ],
          attributes: [
            "id",
            "title",
            "thumbnailUrl",
            "cookTimeMinutes",
            "difficulty",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNumber,
      offset: offset,
    });

    const formattedFavorites = rows.map((item) => {
      const recipe = item.recipe || {};
      const author = recipe.author || {};
      return {
        recipeId: item.recipeId,
        title: recipe.title || "",
        thumbnailUrl: recipe.thumbnailUrl || null,
        cookTimeMinutes: recipe.cookTimeMinutes || 0,
        difficulty: recipe.difficulty || "",
        author: author.id
          ? {
              userId: author.id,
              username: author.username,
            }
          : null,
        personalNotes: item.personalNotes || "",
        createdAt: item.createdAt,
      };
    });

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
        items: formattedFavorites,
      },
    };
  } catch (error) {
    console.log("getUserFavorites error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 5.2 POST /api/v1/favorites/:recipeId - Thêm món ăn vào danh sách yêu thích (UC-12)
const addFavorite = async (userId, recipeId, personalNotes) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const parsedRecipeId = parseRecipeId(recipeId);
    if (parsedRecipeId === null) {
      return {
        EC: 1,
        EM: "ID món ăn không hợp lệ!",
        DT: null,
      };
    }

    const noteContent = personalNotes ? String(personalNotes).trim() : null;
    if (noteContent && noteContent.length > 500) {
      return {
        EC: 1,
        EM: "Ghi chú cá nhân không được vượt quá 500 ký tự!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: parsedRecipeId,
        isDeleted: false,
      },
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy món ăn để thêm vào yêu thích!",
        DT: null,
      };
    }

    const isOwner = recipe.authorId === Number(userId);
    const isApproved =
      recipe.approvalStatus === "Approved" || recipe.status === "Approved";
    const isPublic =
      recipe.isPublic !== undefined
        ? Boolean(recipe.isPublic)
        : !recipe.isPrivate;
    const isApprovedPublic = isApproved && isPublic;
    if (!isApprovedPublic && !isOwner) {
      return {
        EC: 3,
        EM: "Không tìm thấy món ăn để thêm vào yêu thích!",
        DT: null,
      };
    }

    const existingFavorite = await db.FavoriteRecipe.findOne({
      where: {
        userId: Number(userId),
        recipeId: parsedRecipeId,
      },
    });

    if (existingFavorite) {
      return {
        EC: 2,
        EM: "Món ăn này đã tồn tại trong danh sách yêu thích!",
        DT: null,
      };
    }

    await db.FavoriteRecipe.create({
      userId: Number(userId),
      recipeId: parsedRecipeId,
      personalNotes: noteContent,
    });

    return {
      EC: 0,
      EM: "Đã thêm vào bộ sưu tập yêu thích!",
      DT: null,
    };
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return {
        EC: 2,
        EM: "Món ăn này đã tồn tại trong danh sách yêu thích!",
        DT: null,
      };
    }
    console.log("addFavorite error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 5.3 PUT /api/v1/favorites/:recipeId - Sửa ghi chú món yêu thích (UC-12)
const updateFavoriteNote = async (userId, recipeId, personalNotes) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const parsedRecipeId = parseRecipeId(recipeId);
    if (parsedRecipeId === null) {
      return {
        EC: 1,
        EM: "ID món ăn không hợp lệ!",
        DT: null,
      };
    }

    if (personalNotes === undefined || personalNotes === null) {
      return {
        EC: 1,
        EM: "Vui lòng nhập nội dung ghi chú!",
        DT: null,
      };
    }

    const cleanNotes = String(personalNotes).trim();
    if (cleanNotes.length > 500) {
      return {
        EC: 1,
        EM: "Ghi chú cá nhân không được vượt quá 500 ký tự!",
        DT: null,
      };
    }

    const favorite = await db.FavoriteRecipe.findOne({
      where: {
        userId: Number(userId),
        recipeId: parsedRecipeId,
      },
    });

    if (!favorite) {
      return {
        EC: 3,
        EM: "Món ăn chưa có trong danh sách yêu thích của bạn!",
        DT: null,
      };
    }

    await favorite.update({
      personalNotes: cleanNotes,
    });

    return {
      EC: 0,
      EM: "Cập nhật ghi chú thành công!",
      DT: null,
    };
  } catch (error) {
    console.log("updateFavoriteNote error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 5.4 DELETE /api/v1/favorites/:recipeId - Bỏ món ăn khỏi danh sách yêu thích (UC-12)
const removeFavorite = async (userId, recipeId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const parsedRecipeId = parseRecipeId(recipeId);
    if (parsedRecipeId === null) {
      return {
        EC: 1,
        EM: "ID món ăn không hợp lệ!",
        DT: null,
      };
    }

    const favorite = await db.FavoriteRecipe.findOne({
      where: {
        userId: Number(userId),
        recipeId: parsedRecipeId,
      },
    });

    if (!favorite) {
      return {
        EC: 3,
        EM: "Món ăn chưa có trong danh sách yêu thích của bạn!",
        DT: null,
      };
    }

    await favorite.destroy();

    return {
      EC: 0,
      EM: "Đã xóa khỏi danh sách yêu thích!",
      DT: null,
    };
  } catch (error) {
    console.log("removeFavorite error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

module.exports = {
  getUserFavorites,
  addFavorite,
  updateFavoriteNote,
  removeFavorite,
};

import db from "../models/index";
import { isQualitativeUnit } from "./unitService";

const getRecipeById = async (id, viewerId = null, viewerRole = null) => {
  try {
    let recipeId = Number(id);
    if (!recipeId || isNaN(recipeId) || recipeId <= 0) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: recipeId,
        isDeleted: false,
      },
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username"],
        },
        {
          model: db.Category,
          as: "categories",
          attributes: ["id", "categoryName", "createdBy"],
          through: { attributes: [] },
        },
        {
          model: db.RecipeIngredient,
          as: "ingredients",
          include: [
            {
              model: db.Ingredient,
              as: "ingredient",
              attributes: ["id", "ingredientName"],
            },
            {
              model: db.Unit,
              as: "unitGroup",
              attributes: ["id", "unitName"],
            },
          ],
        },
        {
          model: db.CookingStep,
          as: "cookingSteps",
          attributes: ["id", "stepNumber", "instruction"],
        },
      ],
      order: [
        [{ model: db.CookingStep, as: "cookingSteps" }, "stepNumber", "ASC"],
        [{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"],
      ],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    // Kiểm tra quyền xem (UC-07): Công thức riêng tư (isPublic = false) hoặc chưa duyệt (Pending/Rejected)
    // chỉ cho phép xem bởi chính tác giả hoặc Admin
    const isOwner = viewerId && Number(viewerId) === Number(recipe.authorId);
    const isAdmin = viewerRole === "Admin";
    if (!recipe.isPublic || recipe.approvalStatus !== "Approved") {
      if (!isOwner && !isAdmin) {
        return {
          EC: 3,
          EM: "Không tìm thấy công thức nấu ăn!",
          DT: null,
        };
      }
    }

    // Danh mục hệ thống thì ai cũng thấy; danh mục tự tạo chỉ hiện khi chính người tạo đăng nhập
    let formattedCategories = (recipe.categories || [])
      .filter((cat) => {
        if (cat.createdBy === null || cat.createdBy === undefined) {
          return true;
        }
        return viewerId && Number(viewerId) === Number(cat.createdBy);
      })
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      }));

    let formattedIngredients = (recipe.ingredients || []).map((item) => ({
      ingredientId:
        item.ingredientId || (item.ingredient ? item.ingredient.id : null),
      ingredientName: item.ingredient
        ? item.ingredient.ingredientName
        : item.customIngredientName || "",
      quantity: Number(item.quantity),
      unitId: item.unitId || (item.unitGroup ? item.unitGroup.id : null),
      unit: item.unitGroup ? item.unitGroup.unitName : item.customUnit || "",
    }));

    let formattedSteps = (recipe.cookingSteps || []).map((step) => ({
      stepNumber: step.stepNumber,
      instruction: step.instruction,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        recipeId: recipe.id,
        title: recipe.title,
        description: recipe.description || "",
        thumbnailUrl: recipe.thumbnailUrl,
        cookTimeMinutes: recipe.cookTimeMinutes,
        difficulty: recipe.difficulty,
        defaultServings: recipe.defaultServings,
        authorName: recipe.author ? recipe.author.username : "",
        isPublic: recipe.isPublic,
        approvalStatus: recipe.approvalStatus,
        categories: formattedCategories,
        ingredients: formattedIngredients,
        steps: formattedSteps,
      },
    };
  } catch (e) {
    console.log("getRecipeById error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const scaleRecipeIngredients = async (
  id,
  query = {},
  viewerId = null,
  viewerRole = null,
) => {
  try {
    const rawServings =
      query.servings !== undefined ? query.servings : query.targetServings;
    const numServings = Number(rawServings);
    if (
      rawServings === undefined ||
      rawServings === null ||
      String(rawServings).trim() === "" ||
      isNaN(numServings) ||
      !Number.isInteger(numServings) ||
      numServings <= 0
    ) {
      return {
        EC: 1,
        EM: "Số khẩu phần ăn phải lớn hơn 0!",
        DT: null,
      };
    }

    let recipeId = Number(id);
    if (!recipeId || isNaN(recipeId) || recipeId <= 0) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: recipeId,
        isDeleted: false,
      },
      include: [
        {
          model: db.RecipeIngredient,
          as: "ingredients",
          include: [
            {
              model: db.Ingredient,
              as: "ingredient",
              attributes: ["id", "ingredientName"],
            },
            {
              model: db.Unit,
              as: "unitGroup",
              attributes: ["id", "unitName"],
            },
          ],
        },
      ],
      order: [[{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"]],
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức nấu ăn!",
        DT: null,
      };
    }

    // Kiểm tra quyền xem: Chỉ tính toán định lượng cho công thức công khai đã duyệt, hoặc chính tác giả / Admin
    const isOwner = viewerId && Number(viewerId) === Number(recipe.authorId);
    const isAdmin = viewerRole === "Admin";
    if (!recipe.isPublic || recipe.approvalStatus !== "Approved") {
      if (!isOwner && !isAdmin) {
        return {
          EC: 3,
          EM: "Không tìm thấy công thức nấu ăn!",
          DT: null,
        };
      }
    }

    let targetServings = numServings;
    let baseServings =
      Number(recipe.defaultServings) > 0 ? Number(recipe.defaultServings) : 1;
    let scaleFactor = Math.round((targetServings / baseServings) * 100) / 100;

    // Đơn vị định tính theo chuẩn hệ thống (UC-07 - Luồng 2a): Giữ nguyên định lượng gốc, không nhân hệ số N

    let ingredients = (recipe.ingredients || []).map((item) => {
      let baseQuantity = Number(item.quantity);
      let unitName = item.unitGroup
        ? item.unitGroup.unitName
        : item.customUnit || "";
      let ingName = item.ingredient
        ? item.ingredient.ingredientName
        : item.customIngredientName || "";

      const isQualitative = isQualitativeUnit(unitName);

      let scaledQuantity = isQualitative
        ? baseQuantity
        : Math.round(baseQuantity * (targetServings / baseServings) * 100) /
          100;

      return {
        ingredientName: ingName,
        scaledQuantity: scaledQuantity,
        unit: unitName,
      };
    });

    return {
      EC: 0,
      EM: "Tính toán định lượng thành công!",
      DT: {
        recipeId: recipe.id,
        defaultServings: recipe.defaultServings,
        targetServings: targetServings,
        scaleFactor: scaleFactor,
        ingredients: ingredients,
      },
    };
  } catch (e) {
    console.log("scaleRecipeIngredients error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 4.5 GET /api/v1/recipes/mine - Quản lý công thức của tôi (UC-09)
const getMyRecipes = async (user, query = {}) => {
  try {
    const userId = user ? user.id || user.userId : null;
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const { page, limit } = query;

    let pageNumber = 1;
    if (page !== undefined && page !== null && page !== "") {
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
    if (limit !== undefined && limit !== null && limit !== "") {
      limitNumber = Number(limit);
      if (!Number.isInteger(limitNumber) || limitNumber <= 0 || limitNumber > 100) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
    }

    const offset = (pageNumber - 1) * limitNumber;

    const { count, rows: recipes } = await db.Recipe.findAndCountAll({
      where: {
        authorId: userId,
        isDeleted: false,
      },
      attributes: [
        "id",
        "title",
        "thumbnailUrl",
        "cookTimeMinutes",
        "difficulty",
        "defaultServings",
        "isPublic",
        "approvalStatus",
        "rejectionReason",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: limitNumber,
      offset: offset,
    });

    const formatted = recipes.map((r) => ({
      recipeId: r.id,
      title: r.title,
      thumbnailUrl: r.thumbnailUrl,
      cookTimeMinutes: r.cookTimeMinutes,
      difficulty: r.difficulty,
      defaultServings: r.defaultServings,
      isPublic: r.isPublic,
      approvalStatus: r.approvalStatus,
      rejectionReason: r.rejectionReason,
      createdAt: r.createdAt,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
        items: formatted,
      },
    };
  } catch (e) {
    console.log("getMyRecipes error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export { getRecipeById, scaleRecipeIngredients, getMyRecipes };

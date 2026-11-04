import db from "../models/index";
import { Op, Sequelize } from "sequelize";
import { collectionKeyword, collectionTextMatch } from "./recipeSearchService";
import { isQualitativeUnit, normalizeIngredientQuantity } from "./unitService";

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
      quantity: normalizeIngredientQuantity(item.quantity, item.unitGroup?.unitName || item.customUnit || ""),
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

    // Định tính luôn trả 0, kể cả dữ liệu cũ từng lưu lượng dương; không nhân khẩu phần.

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
        ? 0
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

const collectionStatus = (value = "all") => {
  if (typeof value !== "string") throw new Error("Trạng thái không hợp lệ!");
  const status = value.trim().toLowerCase() || "all";
  if (!["all", "approved", "pending", "rejected", "private", "draft"].includes(status)) {
    throw new Error("Trạng thái không hợp lệ!");
  }
  return status === "draft" ? "private" : status;
};

const recipeStatusWhere = (status) => {
  if (status === "all") return {};
  if (status === "rejected") return { approvalStatus: "Rejected" };
  if (status === "private") {
    return { isPublic: false, approvalStatus: { [Op.ne]: "Rejected" } };
  }
  return { isPublic: true, approvalStatus: status[0].toUpperCase() + status.slice(1) };
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

    let keyword, status;
    try {
      keyword = collectionKeyword(query);
      status = collectionStatus(query.status);
    } catch (error) {
      return { EC: 1, EM: error.message, DT: null };
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

    const baseWhere = { authorId: userId, isDeleted: false };
    if (keyword) baseWhere[Op.and] = [collectionTextMatch("Recipe.title", keyword)];

    const { count, rows: recipes } = await db.Recipe.findAndCountAll({
      where: {
        ...baseWhere,
        ...recipeStatusWhere(status),
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
      order: [["createdAt", "DESC"], ["id", "DESC"]],
      limit: limitNumber,
      offset: offset,
    });

    // Aggregate at the database across all tabs, within the same search scope.
    const groups = await db.Recipe.findAll({
      where: baseWhere,
      attributes: ["isPublic", "approvalStatus", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      group: ["isPublic", "approvalStatus"],
      raw: true,
    });
    const totals = { total: 0, approved: 0, pending: 0, rejected: 0, private: 0 };
    for (const group of groups) {
      const amount = Number(group.count);
      const key = group.approvalStatus === "Rejected"
        ? "rejected"
        : group.isPublic ? group.approvalStatus.toLowerCase() : "private";
      totals.total += amount;
      if (Object.prototype.hasOwnProperty.call(totals, key)) totals[key] += amount;
    }

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
        totals,
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

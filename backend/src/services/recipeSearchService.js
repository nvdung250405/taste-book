import db from "../models/index";
import { Op, Sequelize } from "sequelize";
import { hasVietnameseAccents } from "./recipeValidation";

// 4.1 GET /api/v1/recipes - Tìm kiếm / Lọc công thức (UC-06)
const getRecipes = async (query = {}) => {
  try {
    const {
      keyword,
      search,
      categoryId,
      ingredientId,
      difficulty,
      cookingTime,
      cookTime,
      maxCookTime,
      maxTime,
      page,
      limit,
      sortBy,
      sortOrder,
    } = query;

    let whereClause = {
      isPublic: true,
      approvalStatus: "Approved",
      isDeleted: false,
    };

    // 1. Phân trang: page & limit
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
      if (!Number.isInteger(limitNumber) || limitNumber <= 0) {
        return {
          EC: 1,
          EM: "Tham số phân trang page hoặc limit không hợp lệ!",
          DT: null,
        };
      }
      if (limitNumber > 100) limitNumber = 100;
    }

    // 2. Sắp xếp: sortBy & sortOrder
    let orderCol = "createdAt";
    if (sortBy) {
      let cleanSortBy =
        typeof sortBy === "string" ? sortBy.trim() : `${sortBy}`.trim();
      if (cleanSortBy === "cookingTime" || cleanSortBy === "cookTime")
        cleanSortBy = "cookTimeMinutes";
      const allowedSortBy = ["createdAt", "cookTimeMinutes", "title"];
      if (!allowedSortBy.includes(cleanSortBy)) {
        return {
          EC: 1,
          EM: "Tham số sắp xếp không hợp lệ!",
          DT: null,
        };
      }
      orderCol = cleanSortBy;
    }

    let orderDir = "DESC";
    if (sortOrder) {
      let cleanSortOrder = (
        typeof sortOrder === "string" ? sortOrder.trim() : `${sortOrder}`.trim()
      ).toUpperCase();
      if (!["ASC", "DESC"].includes(cleanSortOrder)) {
        return {
          EC: 1,
          EM: "Tham số sắp xếp không hợp lệ!",
          DT: null,
        };
      }
      orderDir = cleanSortOrder;
    }

    // 3. Kiểm tra và lọc theo độ khó (Easy, Medium, Hard)
    if (difficulty !== undefined && difficulty !== null && difficulty !== "") {
      const validDifficulties = ["Easy", "Medium", "Hard"];
      let matchedDifficulty = validDifficulties.find(
        (d) => d.toLowerCase() === difficulty.trim().toLowerCase(),
      );
      if (!matchedDifficulty) {
        return {
          EC: 1,
          EM: "Độ khó không hợp lệ (Chỉ nhận Easy, Medium, Hard)!",
          DT: null,
        };
      }
      whereClause.difficulty = matchedDifficulty;
    }

    // 4. Lọc theo thời gian nấu tối đa (phút)
    let rawTime =
      cookingTime !== undefined
        ? cookingTime
        : cookTime !== undefined
          ? cookTime
          : maxCookTime !== undefined
            ? maxCookTime
            : maxTime;
    if (rawTime !== undefined && rawTime !== null && rawTime !== "") {
      let parsedTime = Number(rawTime);
      if (!Number.isInteger(parsedTime) || parsedTime <= 0) {
        return {
          EC: 1,
          EM: "Thời gian nấu phải là số nguyên dương lớn hơn 0!",
          DT: null,
        };
      }
      whereClause.cookTimeMinutes = { [Op.lte]: parsedTime };
    }

    // Giá trị người dùng được bind riêng, không nối trực tiếp vào SQL literal.
    const bind = {};

    // 5. Lọc theo từ khóa tìm kiếm (Tên món ăn hoặc Tên nguyên liệu)
    let kw = (keyword || search || "").trim();
    if (kw) {
      let isAccented = hasVietnameseAccents(kw);
      let titleCondition = isAccented
        ? { title: { [Op.iLike]: `%${kw}%` } }
        : Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("Recipe.title")),
            { [Op.iLike]: Sequelize.fn("unaccent", `%${kw}%`) },
          );

      bind.recipeSearchKeyword = `%${kw}%`;
      const ingredientMatch = isAccented
        ? `"searchIngredient"."customIngredientName" ILIKE $recipeSearchKeyword
           OR "searchIngredientName"."ingredientName" ILIKE $recipeSearchKeyword`
        : `unaccent("searchIngredient"."customIngredientName") ILIKE unaccent($recipeSearchKeyword)
           OR unaccent("searchIngredientName"."ingredientName") ILIKE unaccent($recipeSearchKeyword)`;
      const ingredientCondition = Sequelize.literal(`EXISTS (
        SELECT 1 FROM "RecipeIngredients" AS "searchIngredient"
        LEFT JOIN "Ingredients" AS "searchIngredientName"
          ON "searchIngredientName"."id" = "searchIngredient"."ingredientId"
        WHERE "searchIngredient"."recipeId" = "Recipe"."id"
          AND (${ingredientMatch})
      )`);

      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push({
        [Op.or]: [titleCondition, ingredientCondition],
      });
    }

    // 6. Lọc theo danh mục món ăn
    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      let catId = Number(categoryId);
      if (isNaN(catId) || !Number.isInteger(catId) || catId <= 0) {
        return {
          EC: 1,
          EM: "Danh mục không hợp lệ!",
          DT: null,
        };
      }
      bind.recipeSearchCategoryId = catId;
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(Sequelize.literal(`EXISTS (
        SELECT 1 FROM "RecipeCategories" AS "searchCategory"
        WHERE "searchCategory"."recipeId" = "Recipe"."id"
          AND "searchCategory"."categoryId" = $recipeSearchCategoryId
      )`));
    }

    // 7. Lọc theo nguyên liệu (ingredientId)
    if (
      ingredientId !== undefined &&
      ingredientId !== null &&
      ingredientId !== ""
    ) {
      let ingId = Number(ingredientId);
      if (isNaN(ingId) || !Number.isInteger(ingId) || ingId <= 0) {
        return {
          EC: 1,
          EM: "Nguyên liệu không hợp lệ!",
          DT: null,
        };
      }
      bind.recipeSearchIngredientId = ingId;
      whereClause[Op.and] = whereClause[Op.and] || [];
      whereClause[Op.and].push(Sequelize.literal(`EXISTS (
        SELECT 1 FROM "RecipeIngredients" AS "filterIngredient"
        WHERE "filterIngredient"."recipeId" = "Recipe"."id"
          AND "filterIngredient"."ingredientId" = $recipeSearchIngredientId
      )`));
    }

    // 8. Truy vấn cơ sở dữ liệu có phân trang và sắp xếp
    const offset = (pageNumber - 1) * limitNumber;
    const { count, rows: recipes } = await db.Recipe.findAndCountAll({
      where: whereClause,
      bind,
      include: [
        {
          model: db.User,
          as: "author",
          attributes: ["id", "username"],
        },
        {
          model: db.Category,
          as: "categories",
          attributes: ["id", "categoryName"],
          through: { attributes: [] },
        },
      ],
      order: [[orderCol, orderDir], ["id", orderDir]],
      limit: limitNumber,
      offset: offset,
      distinct: true,
    });

    let formattedRecipes = recipes.map((recipe) => ({
      recipeId: recipe.id,
      title: recipe.title,
      thumbnailUrl: recipe.thumbnailUrl,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      defaultServings: recipe.defaultServings,
      authorName: recipe.author ? recipe.author.username : "",
      categories: (recipe.categories || []).map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.categoryName,
      })),
    }));

    return {
      EC: 0,
      EM: "Lấy danh sách công thức thành công!",
      DT: {
        page: pageNumber,
        limit: limitNumber,
        total: count,
        totalPages: Math.ceil(count / limitNumber),
        recipes: formattedRecipes,
      },
    };
  } catch (e) {
    console.log("getRecipes error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export { getRecipes };

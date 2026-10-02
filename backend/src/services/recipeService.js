import db from "../models/index";
import { Op } from "sequelize";

const getAllRecipe = async (query = {}) => {
  try {
    const { search, categoryId, difficulty, maxTime } = query;
    let whereClause = {};

    // 1. Lọc theo từ khóa tìm kiếm (Tên món ăn hoặc Tên nguyên liệu)
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { "$ingredients.customIngredientName$": { [Op.iLike]: `%${search}%` } },
        { "$ingredients.ingredient.ingredientName$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // 2. Lọc theo danh mục món ăn
    if (categoryId) {
      whereClause["$categories.id$"] = categoryId;
    }

    // 3. Lọc theo độ khó (Easy, Medium, Hard)
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }

    // 4. Lọc theo thời gian nấu tối đa
    if (maxTime) {
      whereClause.cookTimeMinutes = { [Op.lte]: Number(maxTime) };
    }

    // Luôn ẩn các công thức đã bị xóa an toàn (Soft Delete)
    whereClause.isDeleted = false;

    // Chỉ lấy công thức đã được duyệt (Approved) và công khai (isPublic = true)
    whereClause.approvalStatus = "Approved";
    whereClause.isPublic = true;

    let recipes = await db.Recipe.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: "author",
          attributes: { exclude: ["password"] },
        },
        {
          model: db.Category,
          as: "categories",
          through: { attributes: [] }, // Ẩn cột trung gian RecipeCategory
        },
        {
          model: db.CookingStep,
          as: "cookingSteps",
        },
        {
          model: db.RecipeIngredient,
          as: "ingredients",
          include: [
            {
              model: db.Ingredient,
              as: "ingredient",
            },
          ],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        [{ model: db.CookingStep, as: "cookingSteps" }, "stepNumber", "ASC"],
      ],
      subQuery: false, // Tắt subQuery để thực hiện flat join chính xác khi query trên associations
    });

    if (recipes && recipes.length > 0) {
      return {
        EM: "Tìm kiếm công thức thành công!",
        EC: 0,
        DT: recipes,
      };
    } else {
      return {
        EM: "Không tìm thấy công thức nấu ăn nào phù hợp",
        EC: 0,
        DT: [],
      };
    }
  } catch (e) {
    console.log(e);
    return {
      EM: "sth wrongs with services",
      EC: -500,
      DT: null,
    };
  }
};

const createRecipe = async (data) => {};

const updateRecipe = async (data) => {};

const deleteRecipe = async (id) => {};

module.exports = {
  getAllRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
};

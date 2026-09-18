import db from "../models/index";
import { Sequelize, Op } from "sequelize";

/**
 * 4.0. GET /api/v1/home (UC-01: Lấy dữ liệu công thức Trang chủ)
 * Lấy danh sách công thức mới nhất và công thức thịnh hành
 * @param {object} query - { limit: number }
 */
const getHomeData = async (query = {}) => {
  try {
    let limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 6;
    }
    if (limit > 50) {
      limit = 50;
    }

    const whereCondition = {
      isPublic: true,
      approvalStatus: "Approved",
      isDeleted: false,
    };

    const commonInclude = [
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
    ];

    // Chạy song song 2 truy vấn SQL bằng Promise.all để tối ưu thời gian phản hồi (< 200ms)
    const [latestList, trendingList] = await Promise.all([
      db.Recipe.findAll({
        where: whereCondition,
        attributes: [
          "id",
          "title",
          "thumbnailUrl",
          "cookTimeMinutes",
          "difficulty",
          "defaultServings",
          "createdAt",
          "updatedAt",
        ],
        include: commonInclude,
        // Sắp xếp theo updatedAt DESC để công thức mới duyệt / cập nhật gần nhất đứng đầu
        order: [
          ["updatedAt", "DESC"],
          ["createdAt", "DESC"],
        ],
        limit: limit,
      }),
      db.Recipe.findAll({
        where: {
          ...whereCondition,
          // Chỉ lấy các công thức thực sự có người yêu thích (favoriteCount > 0)
          [Op.and]: [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM "FavoriteRecipes" WHERE "FavoriteRecipes"."recipeId" = "Recipe"."id") > 0'
            ),
          ],
        },
        attributes: [
          "id",
          "title",
          "thumbnailUrl",
          "cookTimeMinutes",
          "difficulty",
          "defaultServings",
          "createdAt",
          "updatedAt",
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM "FavoriteRecipes" WHERE "FavoriteRecipes"."recipeId" = "Recipe"."id")'
            ),
            "favoriteCount",
          ],
        ],
        include: commonInclude,
        order: [
          [Sequelize.literal('"favoriteCount"'), "DESC"],
          ["updatedAt", "DESC"],
        ],
        limit: limit,
      }),
    ]);

    const formatRecipe = (recipe, isTrending = false) => {
      const item = {
        recipeId: recipe.id,
        title: recipe.title,
        thumbnailUrl: recipe.thumbnailUrl,
        cookTimeMinutes: recipe.cookTimeMinutes,
        difficulty: recipe.difficulty,
        defaultServings: recipe.defaultServings,
        author: recipe.author
          ? {
              userId: recipe.author.id,
              username: recipe.author.username,
            }
          : null,
        categories: (recipe.categories || []).map((cat) => ({
          categoryId: cat.id,
          categoryName: cat.categoryName,
        })),
        createdAt: recipe.createdAt,
      };

      if (isTrending) {
        item.favoriteCount = parseInt(recipe.get("favoriteCount") || 0, 10);
      }

      return item;
    };

    return {
      EC: 0,
      EM: "Lấy dữ liệu trang chủ thành công!",
      DT: {
        latestRecipes: latestList.map((r) => formatRecipe(r, false)),
        trendingRecipes: trendingList.map((r) => formatRecipe(r, true)),
      },
    };
  } catch (error) {
    console.log("getHomeData error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export default {
  getHomeData,
};

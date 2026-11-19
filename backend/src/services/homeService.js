import db from "../models/index";
import { Op } from "sequelize";

// Aggregate favorites once, rank before loading author/category associations.
export const TRENDING_RANK_SQL = `SELECT "Recipe"."id", "favorites"."favoriteCount"
  FROM "Recipes" AS "Recipe"
  INNER JOIN (
    SELECT "recipeId", COUNT(*) AS "favoriteCount"
    FROM "FavoriteRecipes" GROUP BY "recipeId"
  ) AS "favorites" ON "favorites"."recipeId" = "Recipe"."id"
  WHERE "Recipe"."isPublic" = TRUE AND "Recipe"."approvalStatus" = 'Approved'
    AND "Recipe"."isDeleted" = FALSE
  ORDER BY "favorites"."favoriteCount" DESC, "Recipe"."updatedAt" DESC, "Recipe"."id" DESC
  LIMIT $limit`;

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
        where: { createdBy: null },
        required: false,
      },
    ];

    const favoriteCounts = new Map();
    const getTrending = async () => {
      const [ranked] = await db.sequelize.query(TRENDING_RANK_SQL, {
        bind: { limit },
      });
      if (!ranked.length) return [];
      for (const row of ranked)
        favoriteCounts.set(Number(row.id), Number(row.favoriteCount));
      const recipes = await db.Recipe.findAll({
        where: {
          ...whereCondition,
          id: { [Op.in]: ranked.map((row) => row.id) },
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
        ],
        include: commonInclude,
      });
      const positions = new Map(
        ranked.map((row, index) => [Number(row.id), index]),
      );
      return recipes.sort(
        (left, right) =>
          positions.get(Number(left.id)) - positions.get(Number(right.id)),
      );
    };

    // Independent latest and trending reads can run concurrently.
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
      getTrending(),
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
        item.favoriteCount = favoriteCounts.get(Number(recipe.id)) || 0;
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

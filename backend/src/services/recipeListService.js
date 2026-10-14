import db from "../models/index";
import { Sequelize, Op } from "sequelize";

const MAX_INTEGER = 2147483647;
const isString = (value) => Object.prototype.toString.call(value) === "[object String]";
const isPositiveInteger = (value) =>
  Number.isInteger(value) && value >= 1 && value <= MAX_INTEGER;
const parsePathId = (value) => {
  if (isString(value)) {
    if (!/^[1-9][0-9]*$/.test(value)) return null;
  } else if (!Number.isInteger(value)) {
    return null;
  }
  const id = Number(value);
  return isPositiveInteger(id) ? id : null;
};

/**
 * 6.1 Lấy danh sách thực đơn của người dùng đang đăng nhập (UC-13)
 * @param {number} userId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const getRecipeLists = async (userId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const lists = await db.RecipeList.findAll({
      where: { userId: Number(userId) },
      include: [
        {
          model: db.RecipeListItem,
          as: "recipeListItems",
          attributes: ["id"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedLists = lists.map((list) => {
      const totalItems = list.recipeListItems ? list.recipeListItems.length : 0;
      return {
        recipeListId: list.id,
        listName: list.listName,
        totalItems: totalItems,
        createdAt: list.createdAt,
      };
    });

    return {
      EC: 0,
      EM: "Thành công!",
      DT: formattedLists,
    };
  } catch (error) {
    console.error("getRecipeLists error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.2 Tạo thực đơn mới (UC-14)
 * @param {number} userId
 * @param {{ listName: string }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const createRecipeList = async (userId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const { listName } = rawData || {};

    if (!isString(listName) || !listName.trim()) {
      return {
        EC: 1,
        EM: "Tên thực đơn không được để trống!",
        DT: null,
      };
    }

    const cleanName = listName.trim();

    if (cleanName.length > 100) {
      return {
        EC: 1,
        EM: "Tên thực đơn không được vượt quá 100 ký tự!",
        DT: null,
      };
    }

    // Kiểm tra tên thực đơn đã tồn tại trong kho của user chưa (không phân biệt hoa thường)
    const existingList = await db.RecipeList.findOne({
      where: {
        userId: Number(userId),
        listName: Sequelize.where(
          Sequelize.fn("lower", Sequelize.col("listName")),
          cleanName.toLowerCase()
        ),
      },
    });

    if (existingList) {
      return {
        EC: 2,
        EM: "Tên thực đơn này đã tồn tại trong danh sách của bạn!",
        DT: null,
      };
    }

    const newList = await db.RecipeList.create({
      userId: Number(userId),
      listName: cleanName,
    });

    return {
      EC: 0,
      EM: "Tạo thực đơn thành công!",
      DT: {
        recipeListId: newList.id,
        listName: newList.listName,
      },
    };
  } catch (error) {
    console.error("createRecipeList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.3 Đổi tên thực đơn (UC-13)
 * @param {number} userId
 * @param {number|string} listId
 * @param {{ listName: string }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const updateRecipeList = async (userId, listId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const id = parsePathId(listId);
    if (!id) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const { listName } = rawData || {};

    if (!isString(listName) || !listName.trim()) {
      return {
        EC: 1,
        EM: "Tên thực đơn không được để trống!",
        DT: null,
      };
    }

    const cleanName = listName.trim();

    if (cleanName.length > 100) {
      return {
        EC: 1,
        EM: "Tên thực đơn không được vượt quá 100 ký tự!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findByPk(id);

    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa thực đơn này!",
        DT: null,
      };
    }

    // Kiểm tra trùng tên với thực đơn khác của chính user này
    const existingOther = await db.RecipeList.findOne({
      where: {
        userId: Number(userId),
        id: { [Op.ne]: id },
        listName: Sequelize.where(
          Sequelize.fn("lower", Sequelize.col("listName")),
          cleanName.toLowerCase()
        ),
      },
    });

    if (existingOther) {
      return {
        EC: 2,
        EM: "Tên thực đơn này đã tồn tại trong danh sách của bạn!",
        DT: null,
      };
    }

    list.listName = cleanName;
    await list.save();

    return {
      EC: 0,
      EM: "Đổi tên thực đơn thành công!",
      DT: null,
    };
  } catch (error) {
    console.error("updateRecipeList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.4 Xóa thực đơn (UC-15)
 * @param {number} userId
 * @param {number|string} listId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const deleteRecipeList = async (userId, listId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const id = parsePathId(listId);
    if (!id) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findByPk(id);

    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xóa thực đơn này!",
        DT: null,
      };
    }

    await list.destroy();

    return {
      EC: 0,
      EM: "Đã xóa thực đơn thành công!",
      DT: null,
    };
  } catch (error) {
    console.error("deleteRecipeList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.5 Xem chi tiết món trong thực đơn (UC-16)
 * @param {number} userId
 * @param {number|string} listId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const getRecipeListDetail = async (userId, listId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const id = parsePathId(listId);
    if (!id) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findOne({
      where: { id: id },
      include: [
        {
          model: db.RecipeListItem,
          as: "recipeListItems",
          include: [
            {
              model: db.Recipe,
              as: "recipe",
              attributes: [
                "id",
                "title",
                "thumbnailUrl",
                "defaultServings",
                "cookTimeMinutes",
                "difficulty",
              ],
              include: [
                {
                  model: db.User,
                  as: "author",
                  attributes: ["id", "username"],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [{ model: db.RecipeListItem, as: "recipeListItems" }, "createdAt", "ASC"],
      ],
    });

    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xem thực đơn này!",
        DT: null,
      };
    }

    const items = (list.recipeListItems || []).map((item) => ({
      recipeListItemId: item.id,
      recipeId: item.recipeId,
      title: item.recipe ? item.recipe.title : "",
      thumbnailUrl: item.recipe ? item.recipe.thumbnailUrl : "",
      cookTimeMinutes: item.recipe ? item.recipe.cookTimeMinutes : 0,
      difficulty: item.recipe ? item.recipe.difficulty : "Easy",
      authorName: item.recipe && item.recipe.author ? item.recipe.author.username : "",
      defaultServings: item.recipe ? item.recipe.defaultServings : 2,
      targetServings: item.targetServings,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: {
        recipeListId: list.id,
        listName: list.listName,
        items: items,
      },
    };
  } catch (error) {
    console.error("getRecipeListDetail error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.6 Thêm món vào thực đơn (UC-16)
 * @param {number} userId
 * @param {number|string} listId
 * @param {{ recipeId: number, targetServings: number }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const addRecipeToRecipeList = async (userId, listId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const lId = parsePathId(listId);
    if (!lId) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const rId = rawData?.recipeId;
    if (!isPositiveInteger(rId)) {
      return {
        EC: 1,
        EM: "Mã món ăn không hợp lệ!",
        DT: null,
      };
    }

    const servings = rawData?.targetServings;
    if (!isPositiveInteger(servings)) {
      return {
        EC: 1,
        EM: "Số khẩu phần ăn targetServings phải lớn hơn 0!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findByPk(lId);
    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa thực đơn này!",
        DT: null,
      };
    }

    const recipe = await db.Recipe.findOne({
      where: {
        id: rId,
        isDeleted: false,
      },
    });

    if (!recipe) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức món ăn!",
        DT: null,
      };
    }

    const isOwner = recipe.authorId === Number(userId);
    const isApproved = recipe.approvalStatus === "Approved" || recipe.status === "Approved";
    const isPublic = recipe.isPublic !== undefined ? Boolean(recipe.isPublic) : !recipe.isPrivate;

    if (!isOwner && (!isApproved || !isPublic)) {
      return {
        EC: 3,
        EM: "Không tìm thấy công thức món ăn!",
        DT: null,
      };
    }

    const existingItem = await db.RecipeListItem.findOne({
      where: {
        recipeListId: lId,
        recipeId: rId,
      },
    });

    if (existingItem) {
      return {
        EC: 2,
        EM: "Món ăn đã có trong thực đơn, vui lòng điều chỉnh số lượng!",
        DT: null,
      };
    }

    const newItem = await db.RecipeListItem.create({
      recipeListId: lId,
      recipeId: rId,
      targetServings: servings,
    });

    return {
      EC: 0,
      EM: "Thêm món vào thực đơn thành công!",
      DT: {
        recipeListItemId: newItem.id,
        recipeId: newItem.recipeId,
        targetServings: newItem.targetServings,
      },
    };
  } catch (error) {
    console.error("addRecipeToRecipeList error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.7 Đổi khẩu phần N món trong thực đơn (UC-16)
 * @param {number} userId
 * @param {number|string} listId
 * @param {number|string} itemId
 * @param {{ targetServings: number }} rawData
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const updateRecipeListItemServings = async (userId, listId, itemId, rawData = {}) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const lId = parsePathId(listId);
    if (!lId) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const itId = parsePathId(itemId);
    if (!itId) {
      return {
        EC: 1,
        EM: "Mã món trong thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const servings = rawData?.targetServings;
    if (!isPositiveInteger(servings)) {
      return {
        EC: 1,
        EM: "Số khẩu phần ăn targetServings phải lớn hơn 0!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findByPk(lId);
    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa thực đơn này!",
        DT: null,
      };
    }

    const item = await db.RecipeListItem.findOne({
      where: {
        id: itId,
        recipeListId: lId,
      },
    });

    if (!item) {
      return {
        EC: 3,
        EM: "Không tìm thấy món ăn trong thực đơn!",
        DT: null,
      };
    }

    await item.update({ targetServings: servings });

    return {
      EC: 0,
      EM: "Cập nhật khẩu phần thành công!",
      DT: null,
    };
  } catch (error) {
    console.error("updateRecipeListItemServings error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

/**
 * 6.8 Xóa món khỏi thực đơn (UC-16)
 * @param {number} userId
 * @param {number|string} listId
 * @param {number|string} itemId
 * @returns {Promise<{ EC: number, EM: string, DT: any }>}
 */
const deleteRecipeListItem = async (userId, listId, itemId) => {
  try {
    if (!userId) {
      return {
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      };
    }

    const lId = parsePathId(listId);
    if (!lId) {
      return {
        EC: 1,
        EM: "Mã thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const itId = parsePathId(itemId);
    if (!itId) {
      return {
        EC: 1,
        EM: "Mã món trong thực đơn không hợp lệ!",
        DT: null,
      };
    }

    const list = await db.RecipeList.findByPk(lId);
    if (!list) {
      return {
        EC: 3,
        EM: "Không tìm thấy thực đơn!",
        DT: null,
      };
    }

    if (list.userId !== Number(userId)) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa thực đơn này!",
        DT: null,
      };
    }

    const item = await db.RecipeListItem.findOne({
      where: {
        id: itId,
        recipeListId: lId,
      },
    });

    if (!item) {
      return {
        EC: 3,
        EM: "Không tìm thấy món ăn trong thực đơn!",
        DT: null,
      };
    }

    await item.destroy();

    return {
      EC: 0,
      EM: "Đã xóa món ăn khỏi thực đơn!",
      DT: null,
    };
  } catch (error) {
    console.error("deleteRecipeListItem error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

export default {
  getRecipeLists,
  createRecipeList,
  updateRecipeList,
  deleteRecipeList,
  getRecipeListDetail,
  addRecipeToRecipeList,
  updateRecipeListItemServings,
  deleteRecipeListItem,
};





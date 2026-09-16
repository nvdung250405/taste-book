import db from "../models/index";
import { Op, Sequelize } from "sequelize";

// 2.1 GET /categories - Lấy danh mục hiển thị (danh mục hệ thống + danh mục do user tạo)
const getCategories = async (userId) => {
  try {
    let whereClause = {
      [Op.or]: [{ createdBy: null }],
    };

    if (userId) {
      whereClause[Op.or].push({ createdBy: userId });
    }

    let categories = await db.Category.findAll({
      where: whereClause,
      attributes: ["id", "categoryName", "createdBy"],
      order: [["id", "ASC"]],
    });

    let formattedCategories = categories.map((c) => ({
      categoryId: c.id,
      categoryName: c.categoryName,
      createdBy: c.createdBy,
    }));

    return {
      EC: 0,
      EM: "Lấy danh mục thành công!",
      DT: formattedCategories,
    };
  } catch (e) {
    console.log("getCategories error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.2 POST /categories - Tạo danh mục cá nhân (UC-25)
const createPersonalCategory = async (userId, data) => {
  try {
    if (!data || !data.categoryName || !data.categoryName.trim()) {
      return {
        EC: 1,
        EM: "Tên danh mục không được để trống!",
        DT: null,
      };
    }

    let cleanName = data.categoryName.trim();

    // Kiểm tra trùng lặp trong kho danh mục cá nhân của user (không phân biệt hoa thường và dấu)
    let exist = await db.Category.findOne({
      where: {
        createdBy: userId,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("categoryName")),
            {
              [Op.iLike]: Sequelize.fn("unaccent", cleanName),
            }
          ),
        ],
      },
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Danh mục này đã tồn tại trong danh sách của bạn!",
        DT: null,
      };
    }

    let newCategory = await db.Category.create({
      categoryName: cleanName,
      createdBy: userId,
    });

    return {
      EC: 0,
      EM: "Tạo danh mục cá nhân thành công!",
      DT: {
        categoryId: newCategory.id,
        categoryName: newCategory.categoryName,
        createdBy: newCategory.createdBy,
      },
    };
  } catch (e) {
    console.log("createPersonalCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.3 PUT /categories/:categoryId - Sửa danh mục cá nhân (UC-25)
const updatePersonalCategory = async (userId, categoryId, data) => {
  try {
    if (!data || !data.categoryName || !data.categoryName.trim()) {
      return {
        EC: 1,
        EM: "Tên danh mục không được để trống!",
        DT: null,
      };
    }

    let id = Number(categoryId);
    if (!id || isNaN(id)) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục cần cập nhật!",
        DT: null,
      };
    }

    let category = await db.Category.findOne({ where: { id } });
    if (!category) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục cần cập nhật!",
        DT: null,
      };
    }

    if (category.createdBy !== userId) {
      return {
        EC: 4,
        EM: "Bạn không có quyền chỉnh sửa danh mục này!",
        DT: null,
      };
    }

    let cleanName = data.categoryName.trim();

    // Kiểm tra tên trùng với danh mục cá nhân khác của mình (không phân biệt hoa thường và dấu)
    let exist = await db.Category.findOne({
      where: {
        createdBy: userId,
        id: { [Op.ne]: id },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("categoryName")),
            {
              [Op.iLike]: Sequelize.fn("unaccent", cleanName),
            }
          ),
        ],
      },
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Danh mục này đã tồn tại trong danh sách của bạn!",
        DT: null,
      };
    }

    category.categoryName = cleanName;
    await category.save();

    return {
      EC: 0,
      EM: "Cập nhật danh mục thành công!",
      DT: {
        categoryId: category.id,
        categoryName: category.categoryName,
      },
    };
  } catch (e) {
    console.log("updatePersonalCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.4 DELETE /categories/:categoryId - Xóa danh mục cá nhân (UC-25)
const deletePersonalCategory = async (userId, categoryId) => {
  try {
    let id = Number(categoryId);
    if (!id || isNaN(id)) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục cần xóa!",
        DT: null,
      };
    }

    let category = await db.Category.findOne({ where: { id } });
    if (!category) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục cần xóa!",
        DT: null,
      };
    }

    if (category.createdBy !== userId) {
      return {
        EC: 4,
        EM: "Bạn không có quyền xóa danh mục này!",
        DT: null,
      };
    }

    // Xóa liên kết trong bảng RecipeCategories nếu có
    await db.RecipeCategory.destroy({ where: { categoryId: id } });

    // Xóa danh mục
    await category.destroy();

    return {
      EC: 0,
      EM: "Đã xóa danh mục cá nhân thành công!",
      DT: null,
    };
  } catch (e) {
    console.log("deletePersonalCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.8 GET /admin/categories - Danh sách danh mục chuẩn hệ thống (UC-21)
const getAdminCategories = async () => {
  try {
    let categories = await db.Category.findAll({
      where: { createdBy: null },
      attributes: ["id", "categoryName", "createdBy"],
      order: [["id", "ASC"]],
    });

    let formattedCategories = categories.map((c) => ({
      categoryId: c.id,
      categoryName: c.categoryName,
      createdBy: c.createdBy,
    }));

    return {
      EC: 0,
      EM: "Lấy danh sách danh mục thành công!",
      DT: formattedCategories,
    };
  } catch (e) {
    console.log("getAdminCategories error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.5 POST /admin/categories - Tạo danh mục chuẩn (UC-21)
const createAdminCategory = async (data) => {
  try {
    if (!data || !data.categoryName || !data.categoryName.trim()) {
      return {
        EC: 1,
        EM: "Tên danh mục không được để trống!",
        DT: null,
      };
    }

    let cleanName = data.categoryName.trim();

    // Kiểm tra trùng lặp trong danh mục hệ thống (không phân biệt hoa thường và dấu)
    let exist = await db.Category.findOne({
      where: {
        createdBy: null,
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("categoryName")),
            {
              [Op.iLike]: Sequelize.fn("unaccent", cleanName),
            }
          ),
        ],
      },
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Danh mục chuẩn đã tồn tại trên hệ thống!",
        DT: null,
      };
    }

    let newCategory = await db.Category.create({
      categoryName: cleanName,
      createdBy: null,
    });

    return {
      EC: 0,
      EM: "Thêm danh mục chuẩn thành công!",
      DT: {
        categoryId: newCategory.id,
        categoryName: newCategory.categoryName,
        createdBy: newCategory.createdBy,
      },
    };
  } catch (e) {
    console.log("createAdminCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.6 PUT /admin/categories/:categoryId - Sửa danh mục chuẩn (UC-21)
const updateAdminCategory = async (categoryId, data) => {
  try {
    if (!data || !data.categoryName || !data.categoryName.trim()) {
      return {
        EC: 1,
        EM: "Tên danh mục không được để trống!",
        DT: null,
      };
    }

    let id = Number(categoryId);
    if (!id || isNaN(id)) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục chuẩn!",
        DT: null,
      };
    }

    let category = await db.Category.findOne({
      where: { id, createdBy: null },
    });

    if (!category) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục chuẩn!",
        DT: null,
      };
    }

    let cleanName = data.categoryName.trim();

    // Kiểm tra trùng tên với danh mục chuẩn khác của hệ thống (không phân biệt hoa thường và dấu)
    let exist = await db.Category.findOne({
      where: {
        createdBy: null,
        id: { [Op.ne]: id },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("categoryName")),
            {
              [Op.iLike]: Sequelize.fn("unaccent", cleanName),
            }
          ),
        ],
      },
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Danh mục chuẩn đã tồn tại trên hệ thống!",
        DT: null,
      };
    }

    category.categoryName = cleanName;
    await category.save();

    return {
      EC: 0,
      EM: "Cập nhật danh mục chuẩn thành công!",
      DT: {
        categoryId: category.id,
        categoryName: category.categoryName,
      },
    };
  } catch (e) {
    console.log("updateAdminCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 2.7 DELETE /admin/categories/:categoryId - Xóa danh mục chuẩn (UC-21)
const deleteAdminCategory = async (categoryId) => {
  try {
    let id = Number(categoryId);
    if (!id || isNaN(id)) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục chuẩn!",
        DT: null,
      };
    }

    let category = await db.Category.findOne({
      where: { id, createdBy: null },
    });

    if (!category) {
      return {
        EC: 3,
        EM: "Không tìm thấy danh mục chuẩn!",
        DT: null,
      };
    }

    // Xóa liên kết trong bảng RecipeCategories nếu có
    await db.RecipeCategory.destroy({ where: { categoryId: id } });

    // Xóa danh mục
    await category.destroy();

    return {
      EC: 0,
      EM: "Xóa danh mục chuẩn thành công!",
      DT: null,
    };
  } catch (e) {
    console.log("deleteAdminCategory error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

module.exports = {
  getCategories,
  createPersonalCategory,
  updatePersonalCategory,
  deletePersonalCategory,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
};







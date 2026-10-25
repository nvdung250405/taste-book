import db from "../models/index";
import { Op, Sequelize } from "sequelize";
import { withMasterDataTransaction, isMasterDataId, isMasterDataName } from "./unitService";

// Hàm kiểm tra chuỗi có chứa dấu tiếng Việt hay không
const hasVietnameseAccents = (str) => {
  return /[\u0300-\u036fàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);
};

// 3.1 GET /api/v1/ingredients - Gợi ý nguyên liệu (UC-08/22)
const getIngredients = async (search, categoryId) => {
  try {
    let conditions = [];

    // 1. Tìm kiếm theo tên nguyên liệu (hỗ trợ cả có dấu và không dấu)
    if (search && search.trim()) {
      let cleanSearch = search.trim();
      if (hasVietnameseAccents(cleanSearch)) {
        // Nếu người dùng gõ có dấu (vd: 'bò'), tìm chính xác theo từ khóa có dấu
        conditions.push({
          ingredientName: {
            [Op.iLike]: `%${cleanSearch}%`,
          },
        });
      } else {
        // Nếu người dùng gõ không dấu (vd: 'bo'), tìm không phân biệt dấu lẫn hoa thường
        conditions.push(
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("ingredientName")),
            {
              [Op.iLike]: `%${cleanSearch}%`,
            }
          )
        );
      }
    }

    // 2. Lọc theo nhóm nguyên liệu (categoryId / ingredientCategoryId)
    if (categoryId && !isNaN(Number(categoryId))) {
      conditions.push({
        ingredientCategoryId: Number(categoryId),
      });
    }

    let whereClause = {};
    if (conditions.length === 1) {
      whereClause = conditions[0];
    } else if (conditions.length > 1) {
      whereClause = { [Op.and]: conditions };
    }

    let ingredients = await db.Ingredient.findAll({
      where: whereClause,
      include: [
        {
          model: db.Unit,
          as: "defaultUnit",
          attributes: ["id", "unitName"],
        },
        {
          model: db.IngredientCategory,
          as: "categoryGroup",
          attributes: ["id", "categoryName"],
        },
      ],
      order: [["id", "ASC"]],
    });

    let formattedIngredients = ingredients.map((item) => ({
      ingredientId: item.id,
      ingredientName: item.ingredientName,
      defaultUnit: item.defaultUnit
        ? {
            unitId: item.defaultUnit.id,
            unitName: item.defaultUnit.unitName,
          }
        : null,
      categoryName: item.categoryGroup?.categoryName || null,
    }));

    return {
      EC: 0,
      EM: "Thành công!",
      DT: formattedIngredients,
    };
  } catch (e) {
    console.log("getIngredients error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 3.2 POST /api/v1/admin/ingredients - Thêm nguyên liệu chuẩn (UC-22)
const createAdminIngredient = async (data) => {
  return withMasterDataTransaction(async (transaction) => {
    if (!data || !isMasterDataName(data.ingredientName)) {
      return {
        EC: 1,
        EM: "Tên nguyên liệu không được để trống!",
        DT: null,
      };
    }

    if (!isMasterDataId(data.ingredientCategoryId)) {
      return {
        EC: 1,
        EM: "Vui lòng chọn nhóm nguyên liệu hợp lệ!",
        DT: null,
      };
    }

    if (!isMasterDataId(data.defaultUnitId)) {
      return {
        EC: 1,
        EM: "Vui lòng chọn đơn vị đo mặc định hợp lệ!",
        DT: null,
      };
    }

    // Kiểm tra nhóm nguyên liệu có tồn tại trong CSDL không
    let category = await db.IngredientCategory.findOne({
      transaction,
      where: { id: Number(data.ingredientCategoryId) },
    });
    if (!category) {
      return {
        EC: 1,
        EM: "Nhóm nguyên liệu không tồn tại trên hệ thống!",
        DT: null,
      };
    }

    // Kiểm tra đơn vị đo có tồn tại trong CSDL không
    let unit = await db.Unit.findOne({
      transaction,
      where: { id: Number(data.defaultUnitId) },
    });
    if (!unit) {
      return {
        EC: 1,
        EM: "Đơn vị đo không tồn tại trên hệ thống!",
        DT: null,
      };
    }

    let cleanName = data.ingredientName.trim();

    // Kiểm tra trùng tên nguyên liệu (không phân biệt hoa thường và dấu tiếng Việt)
    let exist = await db.Ingredient.findOne({
      transaction,
      where: Sequelize.where(
        Sequelize.fn("unaccent", Sequelize.col("ingredientName")),
        {
          [Op.iLike]: Sequelize.fn("unaccent", cleanName),
        }
      ),
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Nguyên liệu đã tồn tại trong hệ thống!",
        DT: null,
      };
    }

    let newIngredient = await db.Ingredient.create({
      ingredientName: cleanName,
      ingredientCategoryId: category.id,
      defaultUnitId: unit.id,
    }, { transaction });

    return {
      EC: 0,
      EM: "Thêm nguyên liệu chuẩn thành công!",
      DT: {
        ingredientId: newIngredient.id,
        ingredientName: newIngredient.ingredientName,
        categoryName: category.categoryName,
      },
    };
  });
};

// 3.3 PUT /api/v1/admin/ingredients/:ingredientId - Sửa nguyên liệu (UC-22)
const updateAdminIngredient = async (ingredientId, data) => {
  return withMasterDataTransaction(async (transaction) => {
    if (!data || !isMasterDataName(data.ingredientName)) {
      return {
        EC: 1,
        EM: "Tên nguyên liệu không được để trống!",
        DT: null,
      };
    }

    if (!isMasterDataId(data.ingredientCategoryId)) {
      return {
        EC: 1,
        EM: "Vui lòng chọn nhóm nguyên liệu hợp lệ!",
        DT: null,
      };
    }

    if (!isMasterDataId(data.defaultUnitId)) {
      return {
        EC: 1,
        EM: "Vui lòng chọn đơn vị đo mặc định hợp lệ!",
        DT: null,
      };
    }

    let id = Number(ingredientId);
    if (!isMasterDataId(ingredientId)) {
      return {
        EC: 3,
        EM: "Không tìm thấy nguyên liệu!",
        DT: null,
      };
    }

    let ingredient = await db.Ingredient.findOne({ transaction, where: { id } });
    if (!ingredient) {
      return {
        EC: 3,
        EM: "Không tìm thấy nguyên liệu!",
        DT: null,
      };
    }

    // Kiểm tra nhóm nguyên liệu có tồn tại không
    let category = await db.IngredientCategory.findOne({
      transaction,
      where: { id: Number(data.ingredientCategoryId) },
    });
    if (!category) {
      return {
        EC: 1,
        EM: "Nhóm nguyên liệu không tồn tại trên hệ thống!",
        DT: null,
      };
    }

    // Kiểm tra đơn vị đo có tồn tại không
    let unit = await db.Unit.findOne({
      transaction,
      where: { id: Number(data.defaultUnitId) },
    });
    if (!unit) {
      return {
        EC: 1,
        EM: "Đơn vị đo không tồn tại trên hệ thống!",
        DT: null,
      };
    }

    let cleanName = data.ingredientName.trim();

    // Kiểm tra trùng tên nguyên liệu khác (không phân biệt hoa thường và dấu tiếng Việt)
    let exist = await db.Ingredient.findOne({
      transaction,
      where: {
        id: { [Op.ne]: id },
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("unaccent", Sequelize.col("ingredientName")),
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
        EM: "Nguyên liệu đã tồn tại trong hệ thống!",
        DT: null,
      };
    }

    if (Number(ingredient.defaultUnitId) !== Number(unit.id)) {
      const usage = await db.RecipeIngredient.count({
        where: { ingredientId: id },
        include: [{ model: db.Recipe, as: "recipe", required: true, where: { isDeleted: false } }],
        transaction,
      });
      if (usage > 0) {
        return { EC: 2, EM: "Không thể đổi đơn vị mặc định của nguyên liệu đang được công thức hoạt động sử dụng!", DT: null };
      }
    }
    ingredient.ingredientName = cleanName;
    ingredient.ingredientCategoryId = category.id;
    ingredient.defaultUnitId = unit.id;
    await ingredient.save({ transaction });

    return {
      EC: 0,
      EM: "Cập nhật nguyên liệu thành công!",
      DT: null,
    };
  });
};

// 3.4 DELETE /api/v1/admin/ingredients/:ingredientId - Xóa nguyên liệu (UC-22)
const deleteAdminIngredient = async (ingredientId) => {
  return withMasterDataTransaction(async (transaction) => {
    let id = Number(ingredientId);
    if (!isMasterDataId(ingredientId)) {
      return {
        EC: 3,
        EM: "Không tìm thấy nguyên liệu!",
        DT: null,
      };
    }

    let ingredient = await db.Ingredient.findOne({ transaction, where: { id } });
    if (!ingredient) {
      return {
        EC: 3,
        EM: "Không tìm thấy nguyên liệu!",
        DT: null,
      };
    }

    const usage = await db.RecipeIngredient.count({
      where: { ingredientId: id },
      include: [{ model: db.Recipe, as: "recipe", required: true, where: { isDeleted: false } }],
      transaction,
    });
    if (usage > 0) {
      return { EC: 2, EM: "Không thể xóa nguyên liệu đang được công thức hoạt động sử dụng!", DT: null };
    }
    // Lưu tên nguyên liệu cho công thức đã xóa mềm trước khi khóa ngoại được đặt thành NULL.
    await db.RecipeIngredient.update(
      { customIngredientName: ingredient.ingredientName },
      {
        where: {
          ingredientId: id,
        },
        validate: false,
        transaction,
      }
    );

    await ingredient.destroy({ transaction });

    return {
      EC: 0,
      EM: "Xóa nguyên liệu thành công!",
      DT: null,
    };
  });
};

// 3.5 GET /api/v1/ingredient-categories - Lấy nhóm nguyên liệu (UC-22)
const getIngredientCategories = async () => {
  try {
    let categories = await db.IngredientCategory.findAll({
      attributes: [["id", "ingredientCategoryId"], "categoryName"],
      order: [["id", "ASC"]],
    });

    return {
      EC: 0,
      EM: "Thành công!",
      DT: categories,
    };
  } catch (e) {
    console.log("getIngredientCategories error:", e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

// 3.6 POST /api/v1/admin/ingredient-categories - Tạo nhóm nguyên liệu (UC-22)
const createAdminIngredientCategory = async (data) => {
  return withMasterDataTransaction(async (transaction) => {
    if (!data || !isMasterDataName(data.categoryName)) {
      return {
        EC: 1,
        EM: "Tên nguyên liệu không được để trống!",
        DT: null,
      };
    }

    let cleanName = data.categoryName.trim();

    // Kiểm tra trùng tên nhóm nguyên liệu (không phân biệt hoa thường và dấu tiếng Việt)
    let exist = await db.IngredientCategory.findOne({
      transaction,
      where: Sequelize.where(
        Sequelize.fn("unaccent", Sequelize.col("categoryName")),
        {
          [Op.iLike]: Sequelize.fn("unaccent", cleanName),
        }
      ),
    });

    if (exist) {
      return {
        EC: 2,
        EM: "Nhóm nguyên liệu đã tồn tại!",
        DT: null,
      };
    }

    let newCategory = await db.IngredientCategory.create({
      categoryName: cleanName,
    }, { transaction });

    return {
      EC: 0,
      EM: "Thêm nhóm nguyên liệu thành công!",
      DT: {
        ingredientCategoryId: newCategory.id,
        categoryName: newCategory.categoryName,
      },
    };
  });
};

module.exports = {
  getIngredients,
  createAdminIngredient,
  updateAdminIngredient,
  deleteAdminIngredient,
  getIngredientCategories,
  createAdminIngredientCategory,
};




import ingredientService from "../services/ingredientService";

const mapEcToStatus = (ec) => {
  switch (ec) {
    case 0:
      return 200;
    case 1:
      return 400;
    case 2:
      return 409;
    case 3:
      return 404;
    case 4:
      return 403;
    case 5:
      return 401;
    case -1:
    default:
      return 500;
  }
};

// 3.1 GET /ingredients - Gợi ý nguyên liệu (UC-08/22)
const handleGetIngredients = async (req, res) => {
  try {
    let search = req.query.search;
    let categoryId = req.query.categoryId || req.query.ingredientCategoryId;
    let result = await ingredientService.getIngredients(search, categoryId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.2 POST /admin/ingredients - Thêm nguyên liệu chuẩn (UC-22)
const handleAdminCreateIngredient = async (req, res) => {
  try {
    let result = await ingredientService.createAdminIngredient(req.body);
    let statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.3 PUT /admin/ingredients/:ingredientId - Sửa nguyên liệu (UC-22)
const handleAdminUpdateIngredient = async (req, res) => {
  try {
    let ingredientId = req.params.ingredientId;
    let result = await ingredientService.updateAdminIngredient(ingredientId, req.body);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.4 DELETE /admin/ingredients/:ingredientId - Xóa nguyên liệu (UC-22)
const handleAdminDeleteIngredient = async (req, res) => {
  try {
    let ingredientId = req.params.ingredientId;
    let result = await ingredientService.deleteAdminIngredient(ingredientId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.5 GET /ingredient-categories - Lấy nhóm nguyên liệu (UC-22)
const handleGetIngredientCategories = async (req, res) => {
  try {
    let result = await ingredientService.getIngredientCategories();
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.6 POST /admin/ingredient-categories - Tạo nhóm nguyên liệu (UC-22)
const handleAdminCreateIngredientCategory = async (req, res) => {
  try {
    let result = await ingredientService.createAdminIngredientCategory(req.body);
    let statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

module.exports = {
  handleGetIngredients,
  handleAdminCreateIngredient,
  handleAdminUpdateIngredient,
  handleAdminDeleteIngredient,
  handleGetIngredientCategories,
  handleAdminCreateIngredientCategory,
};



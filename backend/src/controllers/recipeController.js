import recipeService from "../services/recipeService";

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

// 4.1 GET /api/v1/recipes - Tìm kiếm / Lọc công thức (UC-06)
const handleGetRecipes = async (req, res) => {
  try {
    let result = await recipeService.getRecipes(req.query);
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

// 4.2 GET /api/v1/recipes/{recipeId} - Xem chi tiết công thức (UC-07)
const handleGetRecipeById = async (req, res) => {
  try {
    let viewerId = req.user ? req.user.id || req.user.userId : null;
    let viewerRole = req.user ? req.user.role : null;
    let result = await recipeService.getRecipeById(req.params.recipeId, viewerId, viewerRole);
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

// 4.3 GET /api/v1/recipes/{recipeId}/scale - Tính định lượng theo N người (UC-07)
const handleScaleRecipe = async (req, res) => {
  try {
    let viewerId = req.user ? req.user.id || req.user.userId : null;
    let viewerRole = req.user ? req.user.role : null;
    let result = await recipeService.scaleRecipeIngredients(
      req.params.recipeId,
      req.query,
      viewerId,
      viewerRole
    );
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

// 4.4 POST /api/v1/recipes - Người dùng tạo công thức mới (UC-08)
const handleCreateRecipe = async (req, res) => {
  try {
    let result = await recipeService.createRecipe(req.user, req.body);
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

// 4.5 GET /api/v1/recipes/mine - Quản lý công thức của tôi (UC-09)
const handleGetMyRecipes = async (req, res) => {
  try {
    let result = await recipeService.getMyRecipes(req.user);
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

// 4.6 PUT /api/v1/recipes/{recipeId} - Sửa công thức cá nhân (UC-10)
const handleUpdateRecipe = async (req, res) => {
  try {
    let result = await recipeService.updateRecipe(
      req.params.recipeId,
      req.user,
      req.body
    );
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

// 4.7 DELETE /api/v1/recipes/{recipeId} - Xóa mềm công thức (UC-11)
const handleDeleteRecipe = async (req, res) => {
  try {
    let result = await recipeService.deleteRecipe(
      req.params.recipeId,
      req.user
    );
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

// 4.8 GET /api/v1/admin/recipes - Admin xem toàn bộ công thức (UC-19)
const handleAdminGetRecipes = async (req, res) => {
  try {
    let result = await recipeService.adminGetRecipes(req.query);
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

// 4.9 POST /api/v1/admin/recipes - Admin tạo công thức chuẩn hệ thống (UC-19)
const handleAdminCreateRecipe = async (req, res) => {
  try {
    let result = await recipeService.adminCreateRecipe(req.user, req.body);
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

// 4.10 PUT /api/v1/admin/recipes/{recipeId} - Admin sửa công thức chuẩn hệ thống (UC-19)
const handleAdminUpdateRecipe = async (req, res) => {
  try {
    let result = await recipeService.adminUpdateRecipe(
      req.params.recipeId,
      req.user,
      req.body
    );
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

// 4.11 DELETE /api/v1/admin/recipes/{recipeId} - Admin xóa công thức chuẩn hệ thống (UC-19)
const handleAdminDeleteRecipe = async (req, res) => {
  try {
    let result = await recipeService.adminDeleteRecipe(
      req.params.recipeId,
      req.user
    );
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

// 4.12 GET /api/v1/admin/recipes/pending - Xem danh sách công thức chờ duyệt (UC-20)
const handleAdminGetPendingRecipes = async (req, res) => {
  try {
    let result = await recipeService.adminGetPendingRecipes();
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

// 4.13 PATCH /api/v1/admin/recipes/{recipeId}/moderation - Kiểm duyệt công thức (UC-20)
const handleModerateRecipe = async (req, res) => {
  try {
    let result = await recipeService.moderateRecipe(
      req.params.recipeId,
      req.body
    );
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

module.exports = {
  handleGetRecipes,
  handleGetRecipeById,
  handleScaleRecipe,
  handleCreateRecipe,
  handleGetMyRecipes,
  handleUpdateRecipe,
  handleUpdate: handleUpdateRecipe,
  handleDeleteRecipe,
  handleDelete: handleDeleteRecipe,
  handleAdminGetRecipes,
  handleAdminCreateRecipe,
  handleAdminUpdateRecipe,
  handleAdminDeleteRecipe,
  handleAdminGetPendingRecipes,
  handleModerateRecipe,
};

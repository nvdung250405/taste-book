import categoryService from "../services/categoryService";

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

// 2.1 GET /categories - Lấy danh mục hiển thị
const handleGetCategories = async (req, res) => {
  try {
    let userId = req.user?.userId;
    let result = await categoryService.getCategories(userId);
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

// 2.2 POST /categories - Tạo danh mục cá nhân (UC-25)
const handleCreatePersonalCategory = async (req, res) => {
  try {
    let userId = req.user?.userId;
    let result = await categoryService.createPersonalCategory(userId, req.body);
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

// 2.3 PUT /categories/:categoryId - Sửa danh mục cá nhân (UC-25)
const handleUpdatePersonalCategory = async (req, res) => {
  try {
    let userId = req.user?.userId;
    let categoryId = req.params.categoryId;
    let result = await categoryService.updatePersonalCategory(userId, categoryId, req.body);
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

// 2.4 DELETE /categories/:categoryId - Xóa danh mục cá nhân (UC-25)
const handleDeletePersonalCategory = async (req, res) => {
  try {
    let userId = req.user?.userId;
    let categoryId = req.params.categoryId;
    let result = await categoryService.deletePersonalCategory(userId, categoryId);
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

// 2.8 GET /admin/categories - Danh sách danh mục chuẩn (UC-21)
const handleAdminGetCategories = async (req, res) => {
  try {
    let result = await categoryService.getAdminCategories();
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

// 2.5 POST /admin/categories - Tạo danh mục chuẩn (UC-21)
const handleAdminCreateCategory = async (req, res) => {
  try {
    let result = await categoryService.createAdminCategory(req.body);
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

// 2.6 PUT /admin/categories/:categoryId - Sửa danh mục chuẩn (UC-21)
const handleAdminUpdateCategory = async (req, res) => {
  try {
    let categoryId = req.params.categoryId;
    let result = await categoryService.updateAdminCategory(categoryId, req.body);
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

// 2.7 DELETE /admin/categories/:categoryId - Xóa danh mục chuẩn (UC-21)
const handleAdminDeleteCategory = async (req, res) => {
  try {
    let categoryId = req.params.categoryId;
    let result = await categoryService.deleteAdminCategory(categoryId);
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
  handleGetCategories,
  handleCreatePersonalCategory,
  handleUpdatePersonalCategory,
  handleDeletePersonalCategory,
  handleAdminGetCategories,
  handleAdminCreateCategory,
  handleAdminUpdateCategory,
  handleAdminDeleteCategory,
};








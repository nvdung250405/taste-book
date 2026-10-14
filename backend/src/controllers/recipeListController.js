import recipeListService from "../services/recipeListService";

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

/**
 * 6.1 GET /api/v1/recipe-lists (UC-13: Quản lý thực đơn)
 * Lấy danh sách tất cả các thực đơn của người dùng đang đăng nhập
 */
const handleGetRecipeLists = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await recipeListService.getRecipeLists(userId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleGetRecipeLists error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.2 POST /api/v1/recipe-lists (UC-14: Tạo thực đơn mới)
 * Người dùng đã đăng nhập tạo một thực đơn mới
 */
const handleCreateRecipeList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await recipeListService.createRecipeList(userId, req.body);
    const statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("handleCreateRecipeList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.3 PUT /api/v1/recipe-lists/:listId (UC-13: Đổi tên thực đơn)
 * Người dùng cập nhật lại tên của một thực đơn do chính mình sở hữu
 */
const handleUpdateRecipeList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId } = req.params;
    const result = await recipeListService.updateRecipeList(userId, listId, req.body);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleUpdateRecipeList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.4 DELETE /api/v1/recipe-lists/:listId (UC-15: Xóa thực đơn)
 * Người dùng xóa một thực đơn khỏi kho cá nhân của mình
 * FE: Hiển thị popup xác nhận trước khi gọi API này. Cảnh báo rằng nếu thực đơn
 * đang liên kết với danh sách đi chợ chưa hoàn thành, liên kết đó sẽ bị xóa.
 * API thực hiện xóa ngay khi được gọi; không có bước xác nhận ở backend.
 */
const handleDeleteRecipeList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId } = req.params;
    const result = await recipeListService.deleteRecipeList(userId, listId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleDeleteRecipeList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.5 GET /api/v1/recipe-lists/:listId (UC-16: Xem chi tiết món trong thực đơn)
 * Lấy chi tiết thông tin thực đơn cùng danh sách các món ăn có trong thực đơn
 */
const handleGetRecipeListDetail = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId } = req.params;
    const result = await recipeListService.getRecipeListDetail(userId, listId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleGetRecipeListDetail error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.6 POST /api/v1/recipe-lists/:listId/items (UC-16: Thêm món vào thực đơn)
 * Thêm một món ăn vào thực đơn và gán số khẩu phần ăn thực tế N người (targetServings)
 */
const handleAddRecipeToRecipeList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId } = req.params;
    const result = await recipeListService.addRecipeToRecipeList(
      userId,
      listId,
      req.body
    );
    const statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("handleAddRecipeToRecipeList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.7 PUT /api/v1/recipe-lists/:listId/items/:itemId (UC-16: Đổi khẩu phần N món trong thực đơn)
 * Cập nhật lại số lượng khẩu phần ăn N người (targetServings) cho một món ăn đã có trong thực đơn
 */
const handleUpdateRecipeListItemServings = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId, itemId } = req.params;
    const result = await recipeListService.updateRecipeListItemServings(
      userId,
      listId,
      itemId,
      req.body
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleUpdateRecipeListItemServings error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 6.8 DELETE /api/v1/recipe-lists/:listId/items/:itemId (UC-16: Xóa món khỏi thực đơn)
 * Xóa một món ăn ra khỏi thực đơn
 */
const handleDeleteRecipeListItem = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { listId, itemId } = req.params;
    const result = await recipeListService.deleteRecipeListItem(
      userId,
      listId,
      itemId
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleDeleteRecipeListItem error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

export default {
  handleGetRecipeLists,
  handleCreateRecipeList,
  handleUpdateRecipeList,
  handleDeleteRecipeList,
  handleGetRecipeListDetail,
  handleAddRecipeToRecipeList,
  handleUpdateRecipeListItemServings,
  handleDeleteRecipeListItem,
};


import shoppingListService from "../services/shoppingListService";

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
 * 7.1 GET /api/v1/shopping-lists (UC-17: Lấy các phiên đi chợ)
 * Lấy danh sách tất cả các chuyến đi chợ do chính người dùng đang đăng nhập tạo ra
 */
const handleGetShoppingLists = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await shoppingListService.getShoppingLists(userId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleGetShoppingLists error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.2 POST /api/v1/shopping-lists (UC-17/18: Tổng hợp danh sách đi chợ)
 * Tổng hợp và tạo danh sách đi chợ từ 1 hoặc nhiều Thực đơn
 */
const handleGenerateShoppingList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await shoppingListService.generateShoppingList(userId, req.body);
    const statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("handleGenerateShoppingList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.3 GET /api/v1/shopping-lists/:shoppingListId (UC-18: Xem chi tiết checklist mua sắm)
 * Xem chi tiết danh sách checklist nguyên liệu cần mua sắm trong một chuyến đi chợ
 */
const handleGetShoppingListDetail = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { shoppingListId } = req.params;
    const result = await shoppingListService.getShoppingListDetail(userId, shoppingListId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleGetShoppingListDetail error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.4 PATCH /api/v1/shopping-lists/:shoppingListId/items/:itemId (UC-18: Đánh dấu đã mua / chưa mua)
 * Tích chọn đánh dấu mặt hàng đã mua hoặc bỏ đánh dấu khi đang đi chợ
 */
const handleUpdateShoppingListItemStatus = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { shoppingListId, itemId } = req.params;
    const result = await shoppingListService.updateShoppingListItemStatus(
      userId,
      shoppingListId,
      itemId,
      req.body
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleUpdateShoppingListItemStatus error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.5 POST /api/v1/shopping-lists/:shoppingListId/items (UC-18: Thêm món mua ngoài tự do)
 * Thêm mặt hàng phát sinh mua ngoài tự do vào danh sách đi chợ
 */
const handleCreateShoppingListItem = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { shoppingListId } = req.params;
    const result = await shoppingListService.addShoppingListItem(
      userId,
      shoppingListId,
      req.body
    );
    const statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("handleCreateShoppingListItem error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.6 PATCH /api/v1/shopping-lists/:shoppingListId (UC-18: Cập nhật trạng thái chuyến đi chợ)
 * Cập nhật trạng thái của chuyến đi chợ (In_Progress / Completed)
 */
const handleUpdateShoppingListStatus = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { shoppingListId } = req.params;
    const result = await shoppingListService.updateShoppingListStatus(
      userId,
      shoppingListId,
      req.body
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleUpdateShoppingListStatus error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/**
 * 7.7 DELETE /api/v1/shopping-lists/:shoppingListId (UC-18: Xóa phiên đi chợ)
 * Xóa một danh sách đi chợ khỏi tài khoản cá nhân
 */
const handleDeleteShoppingList = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { shoppingListId } = req.params;
    const result = await shoppingListService.deleteShoppingList(
      userId,
      shoppingListId
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleDeleteShoppingList error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

/** 7.8 DELETE /api/v1/shopping-lists/:shoppingListId/items/purchased (UC-18) */
const handleDeletePurchasedItems = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await shoppingListService.deletePurchasedItems(userId, req.params.shoppingListId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleDeletePurchasedItems error:", error);
    return res.status(500).json({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
  }
};

export default {
  handleGetShoppingLists,
  handleGenerateShoppingList,
  handleGetShoppingListDetail,
  handleUpdateShoppingListItemStatus,
  handleCreateShoppingListItem,
  handleUpdateShoppingListStatus,
  handleDeleteShoppingList,
  handleDeletePurchasedItems,
};



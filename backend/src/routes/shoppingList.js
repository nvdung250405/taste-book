import express from "express";
import shoppingListController from "../controllers/shoppingListController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

// 7.1 GET /api/v1/shopping-lists - Lấy các phiên đi chợ (UC-17)
router.get("/", checkUserJWT, shoppingListController.handleGetShoppingLists);

// 7.2 POST /api/v1/shopping-lists - Tổng hợp danh sách đi chợ (UC-17/18)
router.post("/", checkUserJWT, shoppingListController.handleGenerateShoppingList);

// 7.3 GET /api/v1/shopping-lists/:shoppingListId - Xem chi tiết checklist mua sắm (UC-18)
router.get("/:shoppingListId", checkUserJWT, shoppingListController.handleGetShoppingListDetail);

// 7.4 PATCH /api/v1/shopping-lists/:shoppingListId/items/:itemId - Đánh dấu đã mua / chưa mua (UC-18)
router.patch("/:shoppingListId/items/:itemId", checkUserJWT, shoppingListController.handleUpdateShoppingListItemStatus);

// 7.5 POST /api/v1/shopping-lists/:shoppingListId/items - Thêm món mua ngoài tự do (UC-18)
router.post("/:shoppingListId/items", checkUserJWT, shoppingListController.handleCreateShoppingListItem);

// 7.6 PATCH /api/v1/shopping-lists/:shoppingListId - Cập nhật trạng thái chuyến đi chợ (UC-18)
router.patch("/:shoppingListId", checkUserJWT, shoppingListController.handleUpdateShoppingListStatus);

// 7.7 DELETE /api/v1/shopping-lists/:shoppingListId - Xóa phiên đi chợ (UC-18)
router.delete("/:shoppingListId", checkUserJWT, shoppingListController.handleDeleteShoppingList);

// 7.8 DELETE /api/v1/shopping-lists/:shoppingListId/items/purchased - Xóa các mục đã mua (UC-18)
router.delete("/:shoppingListId/items/purchased", checkUserJWT, shoppingListController.handleDeletePurchasedItems);

export default router;


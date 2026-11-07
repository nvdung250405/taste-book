import express from "express";
import recipeListController from "../controllers/recipeListController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

// 6.1 GET /api/v1/recipe-lists - Lấy danh sách thực đơn của người dùng (UC-13)
router.get("/", checkUserJWT, recipeListController.handleGetRecipeLists);

// 6.2 POST /api/v1/recipe-lists - Tạo thực đơn mới (UC-14)
router.post("/", checkUserJWT, recipeListController.handleCreateRecipeList);

// 6.3 PUT /api/v1/recipe-lists/:listId - Đổi tên thực đơn (UC-13)
router.put("/:listId", checkUserJWT, recipeListController.handleUpdateRecipeList);

// 6.4 DELETE /api/v1/recipe-lists/:listId - Xóa thực đơn (UC-15)
router.delete("/:listId", checkUserJWT, recipeListController.handleDeleteRecipeList);

// 6.5 GET /api/v1/recipe-lists/:listId - Xem chi tiết món trong thực đơn (UC-16)
router.get("/:listId", checkUserJWT, recipeListController.handleGetRecipeListDetail);

// 6.6 POST /api/v1/recipe-lists/:listId/items - Thêm món vào thực đơn (UC-16)
router.post("/:listId/items", checkUserJWT, recipeListController.handleAddRecipeToRecipeList);

// 6.7 PUT /api/v1/recipe-lists/:listId/items/:itemId - Đổi khẩu phần N món trong thực đơn (UC-16)
router.put("/:listId/items/:itemId", checkUserJWT, recipeListController.handleUpdateRecipeListItemServings);

// 6.8 DELETE /api/v1/recipe-lists/:listId/items/:itemId - Xóa món khỏi thực đơn (UC-16)
router.delete("/:listId/items/:itemId", checkUserJWT, recipeListController.handleDeleteRecipeListItem);

export default router;

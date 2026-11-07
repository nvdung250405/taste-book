import express from "express";
import favoriteController from "../controllers/favoriteController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

// 5.1 GET /api/v1/favorites - Lấy danh sách món ăn yêu thích (UC-12)
router.get("/", checkUserJWT, favoriteController.handleGetUserFavorites);

// 5.2 POST /api/v1/favorites/:recipeId - Thêm món ăn vào danh sách yêu thích (UC-12)
router.post("/:recipeId", checkUserJWT, favoriteController.handleAddFavorite);

// 5.3 PUT /api/v1/favorites/:recipeId - Sửa ghi chú món yêu thích (UC-12)
router.put(
  "/:recipeId",
  checkUserJWT,
  favoriteController.handleUpdateFavoriteNote,
);

// 5.4 DELETE /api/v1/favorites/:recipeId - Bỏ yêu thích (UC-12)
router.delete(
  "/:recipeId",
  checkUserJWT,
  favoriteController.handleRemoveFavorite,
);

export default router;

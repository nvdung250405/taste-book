import express from "express";
import favoriteController from "../controllers/favoriteController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

// Tất cả endpoints favorites đều yêu cầu xác thực JWT
router.use(checkUserJWT);

// GET /api/v1/favorites - Lấy danh sách món yêu thích của người dùng hiện tại (UC-12)
router.get("/", favoriteController.handleGetFavorites);

// POST /api/v1/favorites/:recipeId hoặc POST /api/v1/favorites - Thêm vào yêu thích
router.post("/", favoriteController.handleAddFavorite);
router.post("/:recipeId", favoriteController.handleAddFavorite);

// PUT /api/v1/favorites/:recipeId - Cập nhật ghi chú cá nhân
router.put("/:recipeId", favoriteController.handleUpdateFavoriteNote);

// DELETE /api/v1/favorites/:recipeId - Bỏ yêu thích
router.delete("/:recipeId", favoriteController.handleRemoveFavorite);

export default router;

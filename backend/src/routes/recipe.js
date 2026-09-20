import express from "express";
import recipeController from "../controllers/recipeController";
import { checkUserJWT, checkUserJWTOptional } from "../middleware/JWTAction";

const router = express.Router();

// 4.1 GET /api/v1/recipes - Tìm kiếm / Lọc công thức (UC-06)
router.get("/", recipeController.handleGetRecipes);

// 4.4 POST /api/v1/recipes - Người dùng tạo công thức mới (UC-08)
router.post("/", checkUserJWT, recipeController.handleCreateRecipe);

// 4.5 GET /api/v1/recipes/mine - Quản lý công thức của tôi (UC-09)
router.get("/mine", checkUserJWT, recipeController.handleGetMyRecipes);

// 4.3 GET /api/v1/recipes/{recipeId}/scale - Tính định lượng theo N người (UC-07)
router.get("/:recipeId/scale", checkUserJWTOptional, recipeController.handleScaleRecipe);

// 4.2 GET /api/v1/recipes/{recipeId} - Xem chi tiết công thức (UC-07)
router.get("/:recipeId", checkUserJWTOptional, recipeController.handleGetRecipeById);

// 4.6 PUT /api/v1/recipes/{recipeId} - Sửa công thức cá nhân (UC-10)
router.put("/:recipeId", checkUserJWT, recipeController.handleUpdateRecipe);
// 4.7 DELETE /api/v1/recipes/{recipeId} - Xóa mềm công thức (UC-11)
router.delete("/:recipeId", checkUserJWT, recipeController.handleDeleteRecipe);

export default router;

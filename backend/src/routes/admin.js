import express from "express";
import userController from "../controllers/userController";
import recipeController from "../controllers/recipeController";
import { checkUserJWT, checkAdminPermission } from "../middleware/JWTAction";

const router = express.Router();

// 1.7 GET /api/v1/admin/users - Danh sách người dùng
router.get("/users", checkUserJWT, checkAdminPermission, userController.handleAdminGetUsers);

// 1.8 GET /api/v1/admin/users/:userId - Chi tiết 1 người dùng
router.get("/users/:userId", checkUserJWT, checkAdminPermission, userController.handleAdminGetUserDetail);
// 4.8 GET /api/v1/admin/recipes - Admin xem danh sách công thức chuẩn hệ thống (UC-19)
router.get("/recipes", checkUserJWT, checkAdminPermission, recipeController.handleAdminGetRecipes);

// 4.9 POST /api/v1/admin/recipes - Admin tạo công thức chuẩn hệ thống (UC-19)
router.post("/recipes", checkUserJWT, checkAdminPermission, recipeController.handleAdminCreateRecipe);

// 4.10 PUT /api/v1/admin/recipes/:recipeId - Admin sửa công thức chuẩn hệ thống (UC-19)
router.put("/recipes/:recipeId", checkUserJWT, checkAdminPermission, recipeController.handleAdminUpdateRecipe);

// 4.11 DELETE /api/v1/admin/recipes/:recipeId - Admin xóa công thức chuẩn hệ thống (UC-19)
router.delete("/recipes/:recipeId", checkUserJWT, checkAdminPermission, recipeController.handleAdminDeleteRecipe);

// 4.12 GET /api/v1/admin/recipes/pending - Xem danh sách công thức chờ duyệt (UC-20)
router.get("/recipes/pending", checkUserJWT, checkAdminPermission, recipeController.handleAdminGetPendingRecipes);

// 4.13 PATCH /api/v1/admin/recipes/:recipeId/moderation - Kiểm duyệt công thức (UC-20)
router.patch("/recipes/:recipeId/moderation", checkUserJWT, checkAdminPermission, recipeController.handleModerateRecipe);

export default router;

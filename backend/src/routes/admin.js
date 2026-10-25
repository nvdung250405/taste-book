import express from "express";
import userController from "../controllers/userController";
import categoryController from "../controllers/categoryController";
import ingredientController from "../controllers/ingredientController";
import unitController from "../controllers/unitController";
import recipeController from "../controllers/recipeController";
import { checkUserJWT, checkAdminPermission } from "../middleware/JWTAction";

const router = express.Router();

// 1.7 GET /api/v1/admin/users - Danh sách người dùng
router.get("/users", checkUserJWT, checkAdminPermission, userController.handleAdminGetUsers);

// 1.8 GET /api/v1/admin/users/:userId - Chi tiết 1 người dùng
router.get("/users/:userId", checkUserJWT, checkAdminPermission, userController.handleAdminGetUserDetail);
// 2.8 GET /api/v1/admin/categories - Danh sách danh mục chuẩn (UC-21)
router.get("/categories", checkUserJWT, checkAdminPermission, categoryController.handleAdminGetCategories);

// 2.5 POST /api/v1/admin/categories - Tạo danh mục chuẩn (UC-21)
router.post("/categories", checkUserJWT, checkAdminPermission, categoryController.handleAdminCreateCategory);

// 2.6 PUT /api/v1/admin/categories/:categoryId - Sửa danh mục chuẩn (UC-21)
router.put("/categories/:categoryId", checkUserJWT, checkAdminPermission, categoryController.handleAdminUpdateCategory);

// 2.7 DELETE /api/v1/admin/categories/:categoryId - Xóa danh mục chuẩn (UC-21)
router.delete("/categories/:categoryId", checkUserJWT, checkAdminPermission, categoryController.handleAdminDeleteCategory);

// 3.2 POST /api/v1/admin/ingredients - Thêm nguyên liệu chuẩn (UC-22)
router.post("/ingredients", checkUserJWT, checkAdminPermission, ingredientController.handleAdminCreateIngredient);

// 3.3 PUT /api/v1/admin/ingredients/:ingredientId - Sửa nguyên liệu (UC-22)
router.put("/ingredients/:ingredientId", checkUserJWT, checkAdminPermission, ingredientController.handleAdminUpdateIngredient);

// 3.4 DELETE /api/v1/admin/ingredients/:ingredientId - Xóa nguyên liệu (UC-22)
router.delete("/ingredients/:ingredientId", checkUserJWT, checkAdminPermission, ingredientController.handleAdminDeleteIngredient);

// 3.6 POST /api/v1/admin/ingredient-categories - Tạo nhóm nguyên liệu (UC-22)
router.post("/ingredient-categories", checkUserJWT, checkAdminPermission, ingredientController.handleAdminCreateIngredientCategory);

// 3.8 POST /api/v1/admin/units - Thêm đơn vị đo mới (UC-23)
router.post("/units", checkUserJWT, checkAdminPermission, unitController.handleAdminCreateUnit);

// 3.9 PUT /api/v1/admin/units/:unitId - Sửa đơn vị đo (UC-23)
router.put("/units/:unitId", checkUserJWT, checkAdminPermission, unitController.handleAdminUpdateUnit);

// 3.10 DELETE /api/v1/admin/units/:unitId - Xóa đơn vị đo (UC-23)
router.delete("/units/:unitId", checkUserJWT, checkAdminPermission, unitController.handleAdminDeleteUnit);

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

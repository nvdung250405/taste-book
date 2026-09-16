import express from "express";
import categoryController from "../controllers/categoryController";
import { checkUserJWT, checkUserJWTOptional } from "../middleware/JWTAction";

const router = express.Router();

// 2.1 GET /api/v1/categories - Lấy danh mục hiển thị (UC-06/08)
router.get("/", checkUserJWTOptional, categoryController.handleGetCategories);

// 2.2 POST /api/v1/categories - Tạo danh mục cá nhân (UC-25)
router.post("/", checkUserJWT, categoryController.handleCreatePersonalCategory);

// 2.3 PUT /api/v1/categories/:categoryId - Sửa danh mục cá nhân (UC-25)
router.put("/:categoryId", checkUserJWT, categoryController.handleUpdatePersonalCategory);

// 2.4 DELETE /api/v1/categories/:categoryId - Xóa danh mục cá nhân (UC-25)
router.delete("/:categoryId", checkUserJWT, categoryController.handleDeletePersonalCategory);

export default router;



import express from "express";
import ingredientController from "../controllers/ingredientController";

const router = express.Router();

// 3.5 GET /api/v1/ingredient-categories - Lấy nhóm nguyên liệu (UC-22)
router.get("/", ingredientController.handleGetIngredientCategories);

export default router;

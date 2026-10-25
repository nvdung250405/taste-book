import express from "express";
import ingredientController from "../controllers/ingredientController";
import { checkUserJWTOptional } from "../middleware/JWTAction";

const router = express.Router();

// 3.1 GET /api/v1/ingredients - Gợi ý nguyên liệu (UC-08/22)
router.get("/", checkUserJWTOptional, ingredientController.handleGetIngredients);

export default router;

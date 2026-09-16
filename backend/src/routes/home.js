import express from "express";
import homeController from "../controllers/homeController";

const router = express.Router();

// 4.0 GET /api/v1/home - Lấy dữ liệu công thức Trang chủ (UC-01)
router.get("/", homeController.handleGetHomeData);

export default router;

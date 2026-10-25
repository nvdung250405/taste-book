import express from "express";
import unitController from "../controllers/unitController";

const router = express.Router();

// 3.7 GET /api/v1/units - Lấy danh sách đơn vị đo (UC-23)
router.get("/", unitController.handleGetUnits);

export default router;

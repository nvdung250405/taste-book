import express from "express";
import userController from "../controllers/userController";
import { checkUserJWT, checkAdminPermission } from "../middleware/JWTAction";

const router = express.Router();

// 1.7 GET /api/v1/admin/users - Danh sách người dùng
router.get("/users", checkUserJWT, checkAdminPermission, userController.handleAdminGetUsers);

// 1.8 GET /api/v1/admin/users/:userId - Chi tiết 1 người dùng
router.get("/users/:userId", checkUserJWT, checkAdminPermission, userController.handleAdminGetUserDetail);

export default router;

import express from "express";
import userController from "../controllers/userController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

// 1.4 GET /api/v1/users/me - Lấy thông tin cá nhân
router.get("/me", checkUserJWT, userController.handleGetProfile);

// 1.5 PUT /api/v1/users/me - Cập nhật hồ sơ
router.put("/me", checkUserJWT, userController.handleUpdateProfile);

// 1.6 PUT /api/v1/users/me/password - Đổi mật khẩu
router.put("/me/password", checkUserJWT, userController.handleChangePassword);

export default router;

import express from "express";
import authController from "../controllers/authController";

const router = express.Router();

// 1.1 POST /api/v1/auth/register
router.post("/register", authController.handleRegister);

// 1.2 POST /api/v1/auth/login
router.post("/login", authController.handleLogin);

// 1.3 POST /api/v1/auth/logout
router.post("/logout", authController.handleLogout);

export default router;

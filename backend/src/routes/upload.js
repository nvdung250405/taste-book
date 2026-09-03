import express from "express";
import { uploadCloud } from "../config/cloudinary";
import uploadController from "../controllers/uploadController";

const router = express.Router();

// 8.1 POST /api/v1/image/upload
router.post("/upload", uploadCloud.single("image"), uploadController.handleUploadSingleImage);

// 8.2 DELETE /api/v1/image/delete
router.delete("/delete", uploadController.handleDeleteImage);

export default router;

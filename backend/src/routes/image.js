import express from "express";
import { uploadCloud } from "../config/cloudinary";
import imageController from "../controllers/imageController";
import { checkUserJWT } from "../middleware/JWTAction";

const router = express.Router();

const uploadMiddleware = (req, res, next) => {
  uploadCloud.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        EC: 1,
        EM: "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
        DT: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        EC: 1,
        EM: "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
        DT: null,
      });
    }

    next();
  });
};

// 8.1 POST /api/v1/images (Tải lên hình ảnh)
router.post("/", checkUserJWT, uploadMiddleware, imageController.handleUploadSingleImage);

// 8.2 DELETE /api/v1/images/{publicId} (Xóa hình ảnh)
router.delete("/:publicId(*)", checkUserJWT, imageController.handleDeleteImage);

export default router;

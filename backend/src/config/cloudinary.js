require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// 1. Cấu hình SDK Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Cấu hình nơi lưu trữ trên Cloudinary (Giữ nguyên 100% độ phân giải & độ sắc nét gốc)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tastebook_uploads", // Tên thư mục gom ảnh trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"], // Định dạng file cho phép
    quality: 100, // Giữ nguyên 100% chất lượng ảnh gốc, không bị nén mờ
  },
});

// Bộ lọc kiểm tra chỉ chấp nhận file ảnh (.jpg, .jpeg, .png, .webp)
const imageFileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
  const isImageMime = file.mimetype.startsWith("image/");
  if (!isImageMime || !allowedExtensions.test(file.originalname)) {
    return cb(
      new Error("File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!"),
      false
    );
  }
  cb(null, true);
};

// 3. Cấu hình Upload ảnh chung (Giới hạn tối đa 5MB / file)
const uploadCloud = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn tối đa 5MB (tránh đẩy file quá nặng)
  },
  fileFilter: imageFileFilter,
});

module.exports = { cloudinary, uploadCloud };

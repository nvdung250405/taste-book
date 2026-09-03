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

// Bộ lọc kiểm tra chỉ chấp nhận file ảnh
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(
      new Error("Định dạng file không hợp lệ! Chỉ chấp nhận file ảnh (jpg, jpeg, png, webp)"),
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

// 4. Cấu hình riêng cho tải ảnh đại diện Avatar (Giới hạn tối đa 2MB / file)
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Giới hạn tối đa 2MB
  },
  fileFilter: imageFileFilter,
});

module.exports = { cloudinary, uploadCloud, uploadAvatar };

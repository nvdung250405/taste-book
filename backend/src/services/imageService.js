const { cloudinary } = require("../config/cloudinary");

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  let cleanUrl = url.split("?")[0].split("#")[0];
  let matches = cleanUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
};

const uploadImage = (file) => {
  try {
    if (!file || !file.path) {
      return {
        EC: 1,
        EM: "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
        DT: null,
      };
    }
    return {
      EC: 0,
      EM: "Tải ảnh lên thành công!",
      DT: {
        imageUrl: file.path,
        publicId: file.filename,
      },
    };
  } catch (error) {
    console.log("uploadImage service error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const deleteImageByPublicId = async (publicId) => {
  try {
    if (!publicId || !publicId.trim()) {
      return {
        EC: 1,
        EM: "Mã định danh ảnh (publicId) không hợp lệ!",
        DT: null,
      };
    }

    let cleanPublicId = decodeURIComponent(publicId.trim());
    if (cleanPublicId.startsWith("http://") || cleanPublicId.startsWith("https://")) {
      cleanPublicId = getPublicIdFromUrl(cleanPublicId) || cleanPublicId;
    }

    let result = await cloudinary.uploader.destroy(cleanPublicId, {
      invalidate: true,
    });

    if (result && result.result === "ok") {
      return {
        EC: 0,
        EM: "Đã xóa ảnh thành công!",
        DT: null,
      };
    } else if (result && result.result === "not found") {
      return {
        EC: 3,
        EM: "Không tìm thấy file ảnh cần xóa!",
        DT: null,
      };
    } else {
      return {
        EC: 1,
        EM: "Mã định danh ảnh (publicId) không hợp lệ!",
        DT: null,
      };
    }
  } catch (error) {
    console.log("deleteImageByPublicId service error:", error);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

module.exports = {
  uploadImage,
  deleteImageByPublicId,
};

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

const deleteImageByPublicId = async (publicId, user) => {
  try {
    if (!user || user.role !== "Admin") {
      return {
        EC: 4,
        EM: "Chỉ Admin được phép xóa hình ảnh!",
        DT: null,
      };
    }

    if (typeof publicId !== "string" || !publicId.trim()) {
      return {
        EC: 1,
        EM: "Mã định danh ảnh (publicId) không hợp lệ!",
        DT: null,
      };
    }

    let cleanPublicId;
    try {
      cleanPublicId = decodeURIComponent(publicId.trim());
    } catch {
      return { EC: 1, EM: "Mã định danh ảnh (publicId) không hợp lệ!", DT: null };
    }
    if (cleanPublicId.startsWith("http://") || cleanPublicId.startsWith("https://")) {
      cleanPublicId = getPublicIdFromUrl(cleanPublicId) || cleanPublicId;
    }

    if (cleanPublicId === "tastebook_uploads/f1plgomkateq3nufqchm") {
      return {
        EC: 4,
        EM: "Không được phép xóa ảnh mặc định của hệ thống!",
        DT: null,
      };
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

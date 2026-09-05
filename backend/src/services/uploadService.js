const { cloudinary } = require("../config/cloudinary");

const getPublicIdFromUrl = (url) => {
  // Regex lấy toàn bộ đoạn path sau '/upload/(v12345/)' và trước đuôi mở rộng file (.png, .jpg)
  let matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
};

const deleteImage = async (url) => {
  try {
    // Gọi hàm destroy của Cloudinary SDK
    let publicId = getPublicIdFromUrl(url);

    if (!publicId) {
      return {
        EC: 1,
        EM: "URL ảnh không hợp lệ",
        DT: null,
      };
    }

    // Thêm { invalidate: true } để xóa sạch cache CDN ngay lập tức
    let result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    // result.result trả về 'ok' nếu xóa thành công, 'not found' nếu không tìm thấy ảnh
    if (result.result === "ok") {
      return {
        EC: 0,
        EM: "Xóa ảnh thành công",
        DT: result,
      };
    } else {
      return {
        EC: 1,
        EM: "Không tìm thấy ảnh hoặc đã bị xóa trước đó",
        DT: result,
      };
    }
  } catch (error) {
    return {
      EC: -500,
      EM: "sth wrongs with services",
      DT: null,
    };
  }
};

module.exports = {
  deleteImage,
};

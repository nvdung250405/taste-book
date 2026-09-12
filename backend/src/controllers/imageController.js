import imageService from "../services/imageService";

const handleUploadSingleImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        EC: 1,
        EM: "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
        DT: null,
      });
    }

    let result = imageService.uploadImage(req.file);
    let statusCode = result.EC === 0 ? 201 : 500;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

const handleDeleteImage = async (req, res) => {
  try {
    let publicId =
      req.params.publicId ||
      (req.params[0] ? req.params[0] : null) ||
      (req.query && (req.query.url || req.query.publicId)) ||
      (req.body && (req.body.publicId || req.body.url));

    let result = await imageService.deleteImageByPublicId(publicId);

    let statusCode = 200;
    if (result.EC === 1) statusCode = 400;
    if (result.EC === 3) statusCode = 404;
    if (result.EC === 5) statusCode = 401;
    if (result.EC === -1) statusCode = 500;

    return res.status(statusCode).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

module.exports = {
  handleUploadSingleImage,
  handleDeleteImage,
};

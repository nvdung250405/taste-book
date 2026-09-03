import uploadService from "../services/uploadService";

const handleUploadSingleImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        EC: -1,
        EM: "Vui lòng chọn 1 file ảnh để upload",
        DT: null,
      });
    }

    // req.file.path chính là đường dẫn ảnh HTTPS do Cloudinary trả về
    return res.status(200).json({
      EC: 0,
      EM: "Upload ảnh thành công",
      DT: {
        imageUrl: req.file.path,
        publicId: req.file.filename,
      },
    });
  } catch (error) {
    return res.status(500).json({
      EC: -1,
      EM: "error from server",
      DT: null,
    });
  }
};

const handleDeleteImage = async (req, res) => {
  try {
    let url = req.body.url;

    if (!url) {
      return res.status(400).json({
        EC: -1,
        EM: "Vui lòng cung cấp URL của ảnh cần xóa",
        DT: null,
      });
    }

    let response = await uploadService.deleteImage(url);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      EC: -500,
      EM: "error from server",
      DT: null,
    });
  }
};

module.exports = {
  handleUploadSingleImage,
  handleDeleteImage,
};

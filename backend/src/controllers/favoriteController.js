import favoriteService from "../services/favoriteService";

const mapEcToStatus = (ec) => {
  switch (ec) {
    case 0:
      return 200;
    case 1:
      return 400;
    case 2:
      return 409;
    case 3:
      return 404;
    case 4:
      return 403;
    case 5:
      return 401;
    case -1:
    default:
      return 500;
  }
};

// 5.1 GET /api/v1/favorites - Lấy danh sách món ăn yêu thích (UC-12)
const handleGetUserFavorites = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const result = await favoriteService.getUserFavorites(userId, req.query);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log("handleGetUserFavorites error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 5.2 POST /api/v1/favorites/:recipeId - Thêm món ăn vào danh sách yêu thích (UC-12)
const handleAddFavorite = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { recipeId } = req.params;
    const { personalNotes } = req.body || {};
    const result = await favoriteService.addFavorite(
      userId,
      recipeId,
      personalNotes,
    );
    const status = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
    return res.status(status).json(result);
  } catch (error) {
    console.log("handleAddFavorite error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 5.3 PUT /api/v1/favorites/:recipeId - Sửa ghi chú món yêu thích (UC-12)
const handleUpdateFavoriteNote = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { recipeId } = req.params;
    const { personalNotes } = req.body || {};
    const result = await favoriteService.updateFavoriteNote(
      userId,
      recipeId,
      personalNotes,
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log("handleUpdateFavoriteNote error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 5.4 DELETE /api/v1/favorites/:recipeId - Bỏ yêu thích (UC-12)
const handleRemoveFavorite = async (req, res) => {
  try {
    const userId = req.user ? req.user.id || req.user.userId : null;
    const { recipeId } = req.params;
    const result = await favoriteService.removeFavorite(userId, recipeId);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log("handleRemoveFavorite error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

module.exports = {
  handleGetUserFavorites,
  handleAddFavorite,
  handleUpdateFavoriteNote,
  handleRemoveFavorite,
};

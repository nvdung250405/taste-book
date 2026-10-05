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

// GET /api/v1/favorites - Lấy danh sách món yêu thích của người dùng
const handleGetFavorites = async (req, res) => {
  try {
    const result = await favoriteService.getFavorites(req.user);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleGetFavorites error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// POST /api/v1/favorites/:recipeId hoặc POST /api/v1/favorites
const handleAddFavorite = async (req, res) => {
  try {
    const recipeId = req.params.recipeId || req.body.recipeId;
    const result = await favoriteService.addFavorite(req.user, recipeId, req.body);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleAddFavorite error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// PUT /api/v1/favorites/:recipeId - Cập nhật ghi chú cá nhân
const handleUpdateFavoriteNote = async (req, res) => {
  try {
    const result = await favoriteService.updateFavoriteNote(
      req.user,
      req.params.recipeId,
      req.body
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleUpdateFavoriteNote error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// DELETE /api/v1/favorites/:recipeId - Bỏ yêu thích
const handleRemoveFavorite = async (req, res) => {
  try {
    const result = await favoriteService.removeFavorite(
      req.user,
      req.params.recipeId
    );
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.error("handleRemoveFavorite error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

export default {
  handleGetFavorites,
  handleAddFavorite,
  handleUpdateFavoriteNote,
  handleRemoveFavorite,
};

import homeService from "../services/homeService";

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

/**
 * 4.0. GET /api/v1/home (UC-01: Lấy dữ liệu công thức Trang chủ)
 */
const handleGetHomeData = async (req, res) => {
  try {
    let result = await homeService.getHomeData(req.query);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log("handleGetHomeData error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

export default {
  handleGetHomeData,
};

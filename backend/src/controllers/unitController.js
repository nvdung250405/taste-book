import unitService from "../services/unitService";

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

// 3.7 GET /units - Lấy danh sách đơn vị đo (UC-23)
const handleGetUnits = async (req, res) => {
  try {
    let result = await unitService.getUnits();
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.8 POST /admin/units - Thêm đơn vị đo mới (UC-23)
const handleAdminCreateUnit = async (req, res) => {
  try {
    let result = await unitService.createAdminUnit(req.body);
    let statusCode = result.EC === 0 ? 201 : mapEcToStatus(result.EC);
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

// 3.9 PUT /admin/units/:unitId - Sửa đơn vị đo (UC-23)
const handleAdminUpdateUnit = async (req, res) => {
  try {
    let unitId = req.params.unitId;
    let result = await unitService.updateAdminUnit(unitId, req.body);
    return res.status(mapEcToStatus(result.EC)).json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

// 3.10 DELETE /admin/units/:unitId - Xóa đơn vị đo (UC-23)
const handleAdminDeleteUnit = async (req, res) => {
  try {
    let unitId = req.params.unitId;
    let result = await unitService.deleteAdminUnit(unitId);
    return res.status(mapEcToStatus(result.EC)).json(result);
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
  handleGetUnits,
  handleAdminCreateUnit,
  handleAdminUpdateUnit,
  handleAdminDeleteUnit,
};

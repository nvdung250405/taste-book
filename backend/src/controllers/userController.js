import userService from "../services/userService";

// Helper map EC -> HTTP Status Code
const mapEcToStatus = (ec) => {
  switch (ec) {
    case 0:
      return 200;
    case 1:
      return 400; // Bad Request
    case 2:
      return 409; // Conflict
    case 3:
      return 404; // Not Found
    case 4:
      return 403; // Forbidden
    case 5:
      return 401; // Unauthorized
    case 6:
      return 401; // Unauthorized (Wrong credentials)
    case -1:
    default:
      return 500; // Server Error
  }
};

// 1.4 GET /users/me
const handleGetProfile = async (req, res) => {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      });
    }

    let result = await userService.getUserProfile(userId);
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

// 1.5 PUT /users/me
const handleUpdateProfile = async (req, res) => {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      });
    }

    let result = await userService.updateUserProfile(userId, req.body);
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

// 1.6 PUT /users/me/password
const handleChangePassword = async (req, res) => {
  try {
    let userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        EC: 5,
        EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
        DT: null,
      });
    }

    let result = await userService.changeUserPassword(userId, req.body);
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

// 1.7 GET /admin/users
const handleAdminGetUsers = async (req, res) => {
  try {
    let result = await userService.getAllUsersAdmin(req.query);
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

// 1.8 GET /admin/users/:userId
const handleAdminGetUserDetail = async (req, res) => {
  try {
    let { userId } = req.params;
    let result = await userService.getUserDetailAdmin(userId);
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
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleAdminGetUsers,
  handleAdminGetUserDetail,
};

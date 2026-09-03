import authService from "../services/authService";

const handleRegister = async (req, res) => {
  try {
    if (!req.body.email || !req.body.phone || !req.body.password || !req.body.username) {
      return res.status(400).json({
        EM: "Vui lòng nhập đầy đủ các thông tin bắt buộc!",
        EC: 1,
        DT: null,
      });
    }

    if (req.body.password && req.body.password.length < 6) {
      return res.status(400).json({
        EM: "Mật khẩu phải có độ dài từ 6 ký tự trở lên!",
        EC: 1,
        DT: null,
      });
    }

    if (req.body.confirmPassword && req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        EM: "Mật khẩu xác nhận không trùng khớp!",
        EC: 1,
        DT: null,
      });
    }

    let data = await authService.registerNewUser(req.body);
    let statusCode = 201;
    if (data.EC === 1) statusCode = 400;
    if (data.EC === 2) statusCode = 409;
    if (data.EC === -1) statusCode = 500;

    return res.status(statusCode).json(data);
  } catch (error) {
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

const handleLogin = async (req, res) => {
  try {
    let data = await authService.handleUserLogin(req.body);

    if (data && data.DT && data.DT.accessToken) {
      res.cookie("jwt", data.DT.accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });
    }

    let statusCode = 200;
    if (data.EC === 1) statusCode = 400;
    if (data.EC === 6) statusCode = 401;
    if (data.EC === -1) statusCode = 500;

    return res.status(statusCode).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (error) {
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

const handleLogout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      maxAge: 0,
    });
    return res.status(200).json({
      EM: "Đăng xuất thành công!",
      EC: 0,
      DT: null,
    });
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
  handleRegister,
  handleLogin,
  handleLogout,
};

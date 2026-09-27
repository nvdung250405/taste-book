import authService from "../services/authService";

const handleRegister = async (req, res) => {
  try {
    let data = await authService.registerNewUser(req.body);

    let statusCode = 201;
    if (data.EC === 1) statusCode = 400;
    if (data.EC === 2) statusCode = 409;
    if (data.EC === -1) statusCode = 500;

    return res.status(statusCode).json(data);
  } catch (error) {
    console.log(error);
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

    let statusCode = 200;
    if (data.EC === 1) statusCode = 400;
    if (data.EC === 6) statusCode = 401;
    if (data.EC === -1) statusCode = 500;

    return res.status(statusCode).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    });
  }
};

const handleLogout = async (req, res) => {
  try {
    let data = authService.handleUserLogout();
    return res.status(200).json(data);
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

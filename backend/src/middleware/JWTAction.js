require("dotenv").config();
import jwt from "jsonwebtoken";
import db from "../models/index";

const nonSecurePaths = ["/logout", "/login", "/register"];

const createJWT = (payload) => {
  let key = process.env.JWT_SECRET;
  let token = null;
  try {
    token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
  } catch (err) {
    console.log(err);
  }
  return token;
};

const verifyToken = (token) => {
  let key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = jwt.verify(token, key);
  } catch (err) {
    console.log(err);
  }
  return decoded;
};

const extracToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const checkUserJWT = async (req, res, next) => {
  if (nonSecurePaths.includes(req.path)) return next();
  let cookies = req.cookies;
  let tokenFromHeader = extracToken(req);

  if ((cookies && cookies.jwt) || tokenFromHeader) {
    let token = cookies && cookies.jwt ? cookies.jwt : tokenFromHeader;
    let decoded = verifyToken(token);
    if (decoded) {
      let currentUserId = decoded.userId || decoded.id;
      if (currentUserId) {
        let user = await db.User.findOne({ where: { id: currentUserId } });
        if (!user) {
          return res.status(401).json({
            EC: 5,
            EM: "Tài khoản không tồn tại trên hệ thống!",
            DT: null,
          });
        }
      }
      req.user = decoded;
      req.token = token;
      return next();
    } else {
      return res.status(401).json({
        EC: 5,
        EM: "Phiên làm việc không hợp lệ hoặc đã hết hạn!",
        DT: null,
      });
    }
  } else {
    return res.status(401).json({
      EC: 5,
      EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
      DT: null,
    });
  }
};

const checkAdminPermission = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({
    EC: 4,
    EM: "Bạn không có quyền thực hiện chức năng quản trị!",
    DT: null,
  });
};

module.exports = {
  createJWT,
  verifyToken,
  checkUserJWT,
  checkAdminPermission,
};

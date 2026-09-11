require("dotenv").config();
import jwt from "jsonwebtoken";
import db from "../models/index";

const nonSecurePaths = ["/login", "/register"];

const createJWT = (payload) => {
  let key = process.env.JWT_SECRET;
  let token = null;
  try {
    token = jwt.sign(payload, key, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });
  } catch (err) {
    console.log("createJWT error:", err);
  }
  return token;
};

const verifyToken = (token) => {
  let key = process.env.JWT_SECRET;
  try {
    return jwt.verify(token, key);
  } catch {
    // Token hết hạn hoặc chữ ký không hợp lệ
    return null;
  }
};

const extractToken = (req) => {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.trim().split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      return parts[1];
    }
  }
  return null;
};

const checkUserJWT = async (req, res, next) => {
  try {
    if (nonSecurePaths.some((path) => req.path.endsWith(path))) return next();

    let tokenFromHeader = extractToken(req);
    let cookies = req.cookies;

    // Ưu tiên Authorization Header trước, nếu không có mới lấy từ Cookie
    let token = tokenFromHeader || (cookies && cookies.jwt ? cookies.jwt : null);

    if (token) {
      let decoded = verifyToken(token);
      if (decoded) {
        let currentUserId = decoded.userId || decoded.id;
        let user = null;
        if (currentUserId) {
          user = await db.User.findOne({ where: { id: currentUserId } });
        }
        if (user) {
          // Gắn dữ liệu người dùng mới nhất từ DB vào req.user
          req.user = {
            userId: user.id,
            id: user.id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            role: user.role,
          };
        } else {
          req.user = decoded;
        }
        req.token = token;
        return next();
      }
    }

    return res.status(401).json({
      EC: 5,
      EM: "Chưa xác thực hoặc phiên đăng nhập đã hết hạn!",
      DT: null,
    });
  } catch (error) {
    console.log("checkUserJWT error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
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

const checkUserJWTOptional = async (req, res, next) => {
  try {
    let tokenFromHeader = extractToken(req);
    let cookies = req.cookies;
    let token = tokenFromHeader || (cookies && cookies.jwt ? cookies.jwt : null);

    if (token) {
      let decoded = verifyToken(token);
      if (decoded) {
        let currentUserId = decoded.userId || decoded.id;
        let user = null;
        if (currentUserId) {
          user = await db.User.findOne({ where: { id: currentUserId } });
        }
        if (user) {
          req.user = {
            userId: user.id,
            id: user.id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            role: user.role,
          };
        } else {
          req.user = decoded;
        }
        req.token = token;
      }
    }
    return next();
  } catch (error) {
    console.log("checkUserJWTOptional error:", error);
    return next();
  }
};

module.exports = {
  createJWT,
  verifyToken,
  extractToken,
  checkUserJWT,
  checkUserJWTOptional,
  checkAdminPermission,
};

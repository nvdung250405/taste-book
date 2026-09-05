require("dotenv").config();
import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { createJWT } from "../middleware/JWTAction";

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  let hashPassword = bcrypt.hashSync(userPassword, salt);
  return hashPassword;
};

const isEmailValid = (email) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
};

const checkEmailExist = async (userEmail) => {
  let user = await db.User.findOne({
    where: {
      email: userEmail,
    },
  });
  if (user) {
    return true;
  }
  return false;
};

const checkPhoneExist = async (userPhone) => {
  let user = await db.User.findOne({
    where: {
      phone: userPhone,
    },
  });
  if (user) {
    return true;
  }
  return false;
};

const registerNewUser = async (rawUserData) => {
  try {
    let isValidEmail = isEmailValid(rawUserData.email);
    if (!isValidEmail) {
      return {
        EM: "Địa chỉ Email không đúng định dạng!",
        EC: 1,
        DT: null,
      };
    }

    let isEmailExist = await checkEmailExist(rawUserData.email);
    if (isEmailExist === true) {
      return {
        EM: "Email hoặc số điện thoại đã được đăng ký trên hệ thống!",
        EC: 2,
        DT: null,
      };
    }
    let isPhoneExist = await checkPhoneExist(rawUserData.phone);
    if (isPhoneExist === true) {
      return {
        EM: "Email hoặc số điện thoại đã được đăng ký trên hệ thống!",
        EC: 2,
        DT: null,
      };
    }
    //hash user password
    let hashPassword = hashUserPassword(rawUserData.password);
    //create new user
    let newUser = await db.User.create({
      email: rawUserData.email,
      username: rawUserData.username,
      password: hashPassword,
      phone: rawUserData.phone,
      role: "User",
    });
    return {
      EM: "Đăng ký tài khoản thành công!",
      EC: 0,
      DT: {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi kết nối máy chủ!",
      EC: -1,
      DT: null,
    };
  }
};

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword);
};

const handleUserLogin = async (rawData) => {
  try {
    if (!rawData.valueLogin || !rawData.password) {
      return {
        EM: "Vui lòng nhập tài khoản và mật khẩu!",
        EC: 1,
        DT: null,
      };
    }

    let user = await db.User.findOne({
      where: {
        [Op.or]: [{ email: rawData.valueLogin }, { phone: rawData.valueLogin }],
      },
    });

    if (user) {
      let isCorrectPassword = checkPassword(rawData.password, user.password);
      if (isCorrectPassword === true) {
        let payload = {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          role: user.role,
        };
        let token = createJWT(payload);
        return {
          EM: "Đăng nhập thành công!",
          EC: 0,
          DT: {
            accessToken: token,
            user: {
              userId: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              role: user.role,
            },
          },
        };
      }
    }

    return {
      EM: "Thông tin tài khoản hoặc mật khẩu không chính xác!",
      EC: 6,
      DT: null,
    };
  } catch (e) {
    console.log(e);
    return {
      EM: "Lỗi kết nối máy chủ!",
      EC: -1,
      DT: null,
    };
  }
};

module.exports = {
  registerNewUser,
  handleUserLogin,
  hashUserPassword,
  checkEmailExist,
  checkPhoneExist,
  isEmailValid,
};

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
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isPhoneValid = (phone) => {
  const re = /^(0|\+84)[35789][0-9]{8}$/;
  return re.test(String(phone).trim());
};

const checkEmailExist = async (userEmail) => {
  let user = await db.User.findOne({
    where: {
      email: userEmail.trim(),
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
      phone: userPhone.trim(),
    },
  });
  if (user) {
    return true;
  }
  return false;
};

const registerNewUser = async (rawUserData) => {
  try {
    let { username, email, password, confirmPassword, phone } = rawUserData;

    // 1. Kiểm tra thiếu trường bắt buộc
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !phone ||
      !username.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      return {
        EC: 1,
        EM: "Vui lòng nhập đầy đủ các thông tin bắt buộc!",
        DT: null,
      };
    }

    // 2. Kiểm tra định dạng Email
    if (!isEmailValid(email)) {
      return {
        EC: 1,
        EM: "Địa chỉ Email không đúng định dạng!",
        DT: null,
      };
    }

    // 3. Kiểm tra định dạng Số điện thoại
    if (!isPhoneValid(phone)) {
      return {
        EC: 1,
        EM: "Số điện thoại không đúng định dạng (phải là số điện thoại 10 số hợp lệ)!",
        DT: null,
      };
    }

    // 4. Kiểm tra độ dài mật khẩu (< 6 ký tự)
    if (password.length < 6) {
      return {
        EC: 1,
        EM: "Mật khẩu phải có độ dài từ 6 ký tự trở lên!",
        DT: null,
      };
    }

    // 5. Kiểm tra mật khẩu xác nhận không trùng khớp
    if (password !== confirmPassword) {
      return {
        EC: 1,
        EM: "Mật khẩu xác nhận không trùng khớp!",
        DT: null,
      };
    }

    // 6. Kiểm tra email đã tồn tại
    let isEmailExist = await checkEmailExist(email);
    if (isEmailExist === true) {
      return {
        EC: 2,
        EM: "Email hoặc số điện thoại đã được đăng ký trên hệ thống!",
        DT: null,
      };
    }

    // 7. Kiểm tra số điện thoại đã tồn tại
    let isPhoneExist = await checkPhoneExist(phone);
    if (isPhoneExist === true) {
      return {
        EC: 2,
        EM: "Email hoặc số điện thoại đã được đăng ký trên hệ thống!",
        DT: null,
      };
    }

    // 8. Mã hóa mật khẩu
    let hashPassword = hashUserPassword(password);

    // 9. Tạo tài khoản mới
    let newUser = await db.User.create({
      email: email.trim(),
      username: username.trim(),
      password: hashPassword,
      phone: phone.trim(),
      avatarUrl:
        "https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png",
      role: "User",
    });

    return {
      EC: 0,
      EM: "Đăng ký tài khoản thành công!",
      DT: {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
      },
    };
  } catch (e) {
    console.log(e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const checkPassword = (inputPassword, hashPassword) => {
  return bcrypt.compareSync(inputPassword, hashPassword);
};

const handleUserLogin = async (rawData) => {
  try {
    let { valueLogin, password } = rawData || {};

    if (!valueLogin || !password || !valueLogin.trim() || !password.trim()) {
      return {
        EC: 1,
        EM: "Vui lòng nhập tài khoản và mật khẩu!",
        DT: null,
      };
    }

    let cleanValue = valueLogin.trim();

    let user = await db.User.findOne({
      where: {
        [Op.or]: [{ email: cleanValue }, { phone: cleanValue }],
      },
    });

    if (user) {
      let isCorrectPassword = checkPassword(password, user.password);
      if (isCorrectPassword === true) {
        let payload = {
          userId: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          role: user.role,
        };
        let token = createJWT(payload);
        return {
          EC: 0,
          EM: "Đăng nhập thành công!",
          DT: {
            accessToken: token,
            user: {
              userId: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              avatarUrl: user.avatarUrl,
              role: user.role,
            },
          },
        };
      }
    }

    return {
      EC: 6,
      EM: "Thông tin tài khoản hoặc mật khẩu không chính xác!",
      DT: null,
    };
  } catch (e) {
    console.log(e);
    return {
      EC: -1,
      EM: "Lỗi kết nối máy chủ!",
      DT: null,
    };
  }
};

const handleUserLogout = () => {
  return {
    EC: 0,
    EM: "Đăng xuất thành công!",
    DT: null,
  };
};

module.exports = {
  registerNewUser,
  handleUserLogin,
  handleUserLogout,
  hashUserPassword,
  checkEmailExist,
  checkPhoneExist,
  isEmailValid,
};

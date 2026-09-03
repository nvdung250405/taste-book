import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

const salt = bcrypt.genSaltSync(10);
const hashUserPassword = (userPassword) => {
  return bcrypt.hashSync(userPassword, salt);
};

// 1.4 GET /users/me - Lấy thông tin cá nhân
const getUserProfile = async (userId) => {
  try {
    let user = await db.User.findOne({
      where: { id: userId },
      attributes: ["id", "username", "email", "phone", "avatarUrl", "role", "createdAt"],
    });

    if (!user) {
      return {
        EC: 3,
        EM: "Không tìm thấy người dùng trên hệ thống!",
        DT: null,
      };
    }

    return {
      EC: 0,
      EM: "Lấy thông tin hồ sơ thành công!",
      DT: {
        userId: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl || null,
        role: user.role,
        createdAt: user.createdAt,
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

// 1.5 PUT /users/me - Cập nhật hồ sơ
const updateUserProfile = async (userId, data) => {
  try {
    if (!data.username || data.username.trim() === "") {
      return {
        EC: 1,
        EM: "Tên hiển thị không được để trống!",
        DT: null,
      };
    }

    let user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        EC: 3,
        EM: "Không tìm thấy người dùng trên hệ thống!",
        DT: null,
      };
    }

    const updateData = {
      username: data.username.trim(),
    };

    if (data.phone && data.phone !== user.phone) {
      let isPhoneExist = await db.User.findOne({
        where: {
          phone: data.phone,
          id: { [Op.ne]: userId },
        },
      });
      if (isPhoneExist) {
        return {
          EC: 2,
          EM: "Số điện thoại đã được đăng ký trên hệ thống!",
          DT: null,
        };
      }
      updateData.phone = data.phone;
    }

    if (data.avatarUrl !== undefined) {
      updateData.avatarUrl = data.avatarUrl;
    }

    await user.update(updateData);

    return {
      EC: 0,
      EM: "Cập nhật hồ sơ thành công!",
      DT: {
        userId: user.id,
        username: user.username,
        phone: user.phone,
        avatarUrl: user.avatarUrl || null,
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

// 1.6 PUT /users/me/password - Đổi mật khẩu
const changeUserPassword = async (userId, data) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = data;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return {
        EC: 1,
        EM: "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận!",
        DT: null,
      };
    }

    let user = await db.User.findOne({ where: { id: userId } });
    if (!user) {
      return {
        EC: 3,
        EM: "Không tìm thấy người dùng trên hệ thống!",
        DT: null,
      };
    }

    let isCorrectPassword = bcrypt.compareSync(oldPassword, user.password);
    if (!isCorrectPassword) {
      return {
        EC: 6,
        EM: "Mật khẩu hiện tại không chính xác!",
        DT: null,
      };
    }

    if (newPassword === oldPassword || newPassword !== confirmNewPassword) {
      return {
        EC: 1,
        EM: "Mật khẩu mới không được trùng mật khẩu cũ hoặc xác nhận không khớp!",
        DT: null,
      };
    }

    let newHashPassword = hashUserPassword(newPassword);
    await user.update({ password: newHashPassword });

    return {
      EC: 0,
      EM: "Đổi mật khẩu thành công!",
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

// 1.7 GET /admin/users - Danh sách người dùng (Admin)
const getAllUsersAdmin = async (query = {}) => {
  try {
    let whereClause = {};

    if (query.keyword) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${query.keyword}%` } },
        { email: { [Op.iLike]: `%${query.keyword}%` } },
        { phone: { [Op.iLike]: `%${query.keyword}%` } },
      ];
    }

    if (query.role) {
      whereClause.role = query.role;
    }

    let users = await db.User.findAll({
      where: whereClause,
      attributes: ["id", "username", "email", "phone", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    let formattedUsers = users.map((u) => ({
      userId: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return {
      EC: 0,
      EM: "Lấy danh sách người dùng thành công!",
      DT: {
        users: formattedUsers,
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

// 1.8 GET /admin/users/:userId - Chi tiết người dùng (Admin)
const getUserDetailAdmin = async (userId) => {
  try {
    let user = await db.User.findOne({
      where: { id: userId },
      attributes: ["id", "username", "email", "phone", "role"],
    });

    if (!user) {
      return {
        EC: 3,
        EM: "Người dùng không tồn tại!",
        DT: null,
      };
    }

    return {
      EC: 0,
      EM: "Lấy chi tiết người dùng thành công!",
      DT: {
        userId: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
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

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getAllUsersAdmin,
  getUserDetailAdmin,
};

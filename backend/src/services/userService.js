import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { cloudinary } from "../config/cloudinary";

const hashUserPassword = (userPassword) => {
  return bcrypt.hashSync(userPassword, 10);
};

const isPhoneValid = (phone) => {
  const re = /^(0|\+84)[35789][0-9]{8}$/;
  return re.test(String(phone).trim());
};

const getPublicIdFromUrl = (url) => {
  if (typeof url !== "string" || !process.env.CLOUDINARY_CLOUD_NAME) return null;
  try {
    const parsedUrl = new URL(url);
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "res.cloudinary.com" ||
      parsedUrl.port || parsedUrl.username || parsedUrl.password
    ) return null;

    const matches = parsedUrl.pathname.match(
      /^\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+?)\.(?:jpg|jpeg|png|webp)$/i,
    );
    if (!matches || matches[1] !== process.env.CLOUDINARY_CLOUD_NAME) return null;
    return matches[2];
  } catch {
    return null;
  }
};

const checkImageSize = async (publicId) => {
  try {
    const resource = await cloudinary.api.resource(publicId);
    if (Number.isSafeInteger(resource?.bytes) && resource.bytes > 0) return resource.bytes;
  } catch {
    // Không gọi trực tiếp URL do người dùng nhập, kể cả khi SDK thất bại.
  }
  return null;
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
    if (!data || !data.username || !data.username.trim()) {
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

    if (data.phone) {
      const cleanPhone = String(data.phone).trim();
      if (!isPhoneValid(cleanPhone)) {
        return {
          EC: 1,
          EM: "Số điện thoại không đúng định dạng (phải là số điện thoại 10 số hợp lệ)!",
          DT: null,
        };
      }
      if (cleanPhone !== user.phone) {
        let isPhoneExist = await db.User.findOne({
          where: {
            phone: cleanPhone,
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
        updateData.phone = cleanPhone;
      }
    }

    if (data.avatarUrl !== undefined && data.avatarUrl !== null && data.avatarUrl !== "") {
      const publicId = getPublicIdFromUrl(data.avatarUrl);
      if (!publicId) {
        return {
          EC: 1,
          EM: "Ảnh đại diện phải là URL HTTPS thuộc Cloudinary của dự án!",
          DT: null,
        };
      }
      if (data.avatarUrl !== user.avatarUrl) {
        const size = await checkImageSize(publicId);
        if (size === null) {
          return { EC: 1, EM: "Không thể xác minh dung lượng ảnh đại diện, vui lòng thử lại!", DT: null };
        }
        if (size > 5 * 1024 * 1024) {
          return {
            EC: 1,
            EM: "Dung lượng tệp ảnh đại diện vượt quá giới hạn cho phép (tối đa 5MB)!",
            DT: null,
          };
        }
      }
      updateData.avatarUrl = data.avatarUrl;
    }

    await user.update(updateData);

    // Không tự xóa ảnh cũ: avatarUrl không chứng minh quyền sở hữu ảnh.
    // Việc xóa tài nguyên Cloudinary được thực hiện qua endpoint dành cho Admin.

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
    const { oldPassword, newPassword, confirmNewPassword, confirmPassword } = data || {};
    const confirm = confirmNewPassword || confirmPassword;

    if (!oldPassword || !newPassword || !confirm || !oldPassword.trim() || !newPassword.trim() || !confirm.trim()) {
      return {
        EC: 1,
        EM: "Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận!",
        DT: null,
      };
    }

    let oldPass = oldPassword.trim();
    let newPass = newPassword.trim();
    let confirmPass = confirm.trim();

    if (newPass === oldPass || newPass !== confirmPass) {
      return {
        EC: 1,
        EM: "Mật khẩu mới không được trùng mật khẩu cũ hoặc xác nhận không khớp!",
        DT: null,
      };
    }

    if (newPass.length < 6) {
      return {
        EC: 1,
        EM: "Mật khẩu mới phải có độ dài từ 6 ký tự trở lên!",
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

    let isCorrectPassword = bcrypt.compareSync(oldPass, user.password);
    if (!isCorrectPassword) {
      return {
        EC: 6,
        EM: "Mật khẩu hiện tại không chính xác!",
        DT: null,
      };
    }

    if (bcrypt.compareSync(newPass, user.password)) {
      return {
        EC: 1,
        EM: "Mật khẩu mới không được trùng mật khẩu cũ hoặc xác nhận không khớp!",
        DT: null,
      };
    }

    let newHashPassword = hashUserPassword(newPass);
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

    if (query.keyword && query.keyword.trim()) {
      let kw = query.keyword.trim();
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${kw}%` } },
        { email: { [Op.iLike]: `%${kw}%` } },
        { phone: { [Op.iLike]: `%${kw}%` } },
      ];
    }

    if (query.role && query.role.trim()) {
      let roleVal = query.role.trim();
      if (roleVal.toLowerCase() === "admin") roleVal = "Admin";
      else if (roleVal.toLowerCase() === "user") roleVal = "User";
      whereClause.role = roleVal;
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
    let parsedId = parseInt(userId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      return {
        EC: 3,
        EM: "Người dùng không tồn tại!",
        DT: null,
      };
    }

    let user = await db.User.findOne({
      where: { id: parsedId },
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

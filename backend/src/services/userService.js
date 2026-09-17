import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { cloudinary } from "../config/cloudinary";

const salt = bcrypt.genSaltSync(10);
const hashUserPassword = (userPassword) => {
  return bcrypt.hashSync(userPassword, salt);
};

const isPhoneValid = (phone) => {
  const re = /^(0|\+84)[35789][0-9]{8}$/;
  return re.test(String(phone).trim());
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  let cleanUrl = url.split("?")[0].split("#")[0];
  let matches = cleanUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
  return matches ? matches[1] : null;
};

const checkImageSize = async (url) => {
  try {
    let publicId = getPublicIdFromUrl(url);
    if (publicId) {
      try {
        let resource = await cloudinary.api.resource(publicId);
        if (resource && resource.bytes) {
          return resource.bytes;
        }
      } catch {
        // Fallback to fetch HEAD
      }
    }
    const response = await fetch(url, { method: "HEAD" });
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
  } catch {
    // Ignore error if URL unreachable
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

    const oldAvatarUrl = user.avatarUrl;
    const DEFAULT_AVATAR_URL =
      "https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png";

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
      if (data.avatarUrl !== user.avatarUrl) {
        let size = await checkImageSize(data.avatarUrl);
        if (size && size > 5 * 1024 * 1024) {
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

    // Tự động dọn dẹp ảnh cũ trên Cloudinary (nếu đổi ảnh mới và ảnh cũ không phải ảnh mặc định)
    if (
      data.avatarUrl &&
      oldAvatarUrl &&
      oldAvatarUrl !== data.avatarUrl &&
      oldAvatarUrl !== DEFAULT_AVATAR_URL &&
      !oldAvatarUrl.includes("f1plgomkateq3nufqchm")
    ) {
      const oldPublicId = getPublicIdFromUrl(oldAvatarUrl);
      if (oldPublicId) {
        cloudinary.uploader.destroy(oldPublicId).catch((err) => {
          console.log("Lỗi khi dọn dẹp ảnh đại diện cũ trên Cloudinary:", err);
        });
      }
    }

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

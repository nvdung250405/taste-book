"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface) => {
    const salt = bcrypt.genSaltSync(10);
    const defaultUserPassword = bcrypt.hashSync("123456", salt);
    const defaultAdminPassword = bcrypt.hashSync("admin123", salt);
    const now = new Date();
    const defaultAvatar =
      "https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png";

    await queryInterface.bulkDelete("Users", null, {});

    await queryInterface.bulkInsert("Users", [
      {
        id: 1,
        username: "System Admin",
        email: "admin@gmail.com",
        password: defaultAdminPassword,
        phone: "0999999999",
        avatarUrl: defaultAvatar,
        role: "Admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        username: "Bếp Trưởng Hoàng",
        email: "chef.hoang@tastebook.vn",
        password: defaultUserPassword,
        phone: "0912345678",
        avatarUrl: defaultAvatar,
        role: "User",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        username: "Nguyễn Thị Lan Anh",
        email: "lananh.kitchen@gmail.com",
        password: defaultUserPassword,
        phone: "0987654321",
        avatarUrl: defaultAvatar,
        role: "User",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        username: "Trần Minh Đức",
        email: "duc.foodie@gmail.com",
        password: defaultUserPassword,
        phone: "0934567890",
        avatarUrl: defaultAvatar,
        role: "User",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    try {
      await queryInterface.sequelize.query(
        'SELECT setval(pg_get_serial_sequence(\'"Users"\', \'id\'), coalesce(max(id), 1)) FROM "Users";'
      );
    } catch {
      // Ignore sequence reset error on SQLite or other environments
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};

"use strict";
const { normalizePhoneNumber } = require("../utils/phoneUtils");

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.sequelize.query('LOCK TABLE "Users" IN SHARE ROW EXCLUSIVE MODE', { transaction });
    const users = await queryInterface.sequelize.query('SELECT id, phone FROM "Users" ORDER BY id', {
      transaction, type: Sequelize.QueryTypes.SELECT,
    });
    const owners = new Map();
    const changes = [];
    for (const user of users) {
      const phone = normalizePhoneNumber(user.phone);
      if (!phone) throw new Error(`Users.id=${user.id} có số điện thoại không hợp lệ; cần sửa trước khi chạy lại migration.`);
      if (owners.has(phone)) {
        throw new Error(`Users.id=${owners.get(phone)} và id=${user.id} trùng số điện thoại sau chuẩn hóa; cần xử lý thủ công, không tự gộp tài khoản.`);
      }
      owners.set(phone, user.id);
      if (phone !== user.phone) changes.push({ id: user.id, phone });
    }
    for (const user of changes) {
      await queryInterface.bulkUpdate("Users", { phone: user.phone }, { id: user.id }, { transaction });
    }
  }),
  // Không thể khôi phục đầu số/whitespace ban đầu sau chuẩn hóa; giữ nguyên dữ liệu khi undo.
  down: async () => {},
};

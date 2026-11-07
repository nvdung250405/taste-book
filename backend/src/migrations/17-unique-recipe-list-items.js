"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    // Chặn ghi trong lúc kiểm tra và tạo unique index, không tự xóa/gộp khẩu phần cũ.
    await queryInterface.sequelize.query('LOCK TABLE "RecipeListItems" IN SHARE ROW EXCLUSIVE MODE', { transaction });
    const duplicates = await queryInterface.sequelize.query(
      'SELECT "recipeListId", "recipeId" FROM "RecipeListItems" GROUP BY "recipeListId", "recipeId" HAVING COUNT(*) > 1 LIMIT 1',
      { transaction, type: Sequelize.QueryTypes.SELECT },
    );
    if (duplicates.length) {
      throw new Error("RecipeListItems có món trùng trong cùng thực đơn. Cần xử lý dữ liệu trùng trước khi chạy lại migration; migration không tự xóa hoặc gộp khẩu phần.");
    }
    await queryInterface.addIndex("RecipeListItems", ["recipeListId", "recipeId"], {
      name: "UQ_RecipeListItems_List_Recipe", unique: true, transaction,
    });
  }),
  down: async queryInterface => queryInterface.removeIndex("RecipeListItems", "UQ_RecipeListItems_List_Recipe"),
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("IngredientCategories", "categoryName", {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },

  // PostgreSQL rejects rollback while names longer than 100 characters exist.
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("IngredientCategories", "categoryName", {
      type: Sequelize.STRING(100),
      allowNull: false,
    });
  },
};

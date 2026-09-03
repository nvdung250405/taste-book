"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RecipeCategories", {
      recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Recipes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("RecipeCategories", ["categoryId"], {
      name: "IX_RecipeCategories_CategoryId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RecipeCategories");
  },
};

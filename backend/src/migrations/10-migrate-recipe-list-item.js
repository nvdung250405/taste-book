"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RecipeListItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      recipeListId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "RecipeLists",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Recipes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      targetServings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("RecipeListItems", ["recipeListId"], {
      name: "IX_RecipeListItems_RecipeListId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RecipeListItems");
  },
};

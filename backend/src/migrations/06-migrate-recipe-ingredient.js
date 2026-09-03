"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RecipeIngredients", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      ingredientId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Ingredients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      customIngredientName: {
        type: Sequelize.STRING,
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      unitId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Units",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      customUnit: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex("RecipeIngredients", ["recipeId"], {
      name: "IX_RecipeIngredients_RecipeId",
    });
    await queryInterface.addIndex("RecipeIngredients", ["ingredientId"], {
      name: "IX_RecipeIngredients_IngredientId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("RecipeIngredients");
  },
};

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ShoppingListItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      shoppingListId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ShoppingLists",
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
      itemName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      totalQuantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isPurchased: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex("ShoppingListItems", ["shoppingListId"], {
      name: "IX_ShoppingListItems_ShoppingListId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ShoppingListItems");
  },
};

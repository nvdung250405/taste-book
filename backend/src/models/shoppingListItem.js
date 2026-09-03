"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShoppingListItem extends Model {
    static associate(models) {
      ShoppingListItem.belongsTo(models.ShoppingList, { foreignKey: "shoppingListId", as: "shoppingList" });
      ShoppingListItem.belongsTo(models.Ingredient, { foreignKey: "ingredientId", as: "ingredient" });
    }
  }
  ShoppingListItem.init(
    {
      shoppingListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ingredientId: {
        type: DataTypes.INTEGER,
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPurchased: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "ShoppingListItem",
      tableName: "ShoppingListItems",
    },
  );
  return ShoppingListItem;
};

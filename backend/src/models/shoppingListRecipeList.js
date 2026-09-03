"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShoppingListRecipeList extends Model {
    static associate(models) {
      ShoppingListRecipeList.belongsTo(models.ShoppingList, { foreignKey: "shoppingListId" });
      ShoppingListRecipeList.belongsTo(models.RecipeList, { foreignKey: "recipeListId" });
    }
  }
  ShoppingListRecipeList.init(
    {
      shoppingListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      recipeListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "ShoppingListRecipeList",
      tableName: "ShoppingListRecipeLists",
      timestamps: false,
    },
  );
  return ShoppingListRecipeList;
};

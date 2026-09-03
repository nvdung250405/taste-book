"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ShoppingList extends Model {
    static associate(models) {
      ShoppingList.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      ShoppingList.hasMany(models.ShoppingListItem, { foreignKey: "shoppingListId", as: "shoppingListItems" });
      ShoppingList.belongsToMany(models.RecipeList, {
        through: models.ShoppingListRecipeList,
        foreignKey: "shoppingListId",
        otherKey: "recipeListId",
        as: "recipeLists",
      });
    }
  }
  ShoppingList.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "In_Progress",
        validate: {
          isIn: [["In_Progress", "Completed"]],
        },
      },
    },
    {
      sequelize,
      modelName: "ShoppingList",
      tableName: "ShoppingLists",
    },
  );
  return ShoppingList;
};

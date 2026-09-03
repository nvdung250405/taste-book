"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RecipeList extends Model {
    static associate(models) {
      RecipeList.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      RecipeList.hasMany(models.RecipeListItem, { foreignKey: "recipeListId", as: "recipeListItems" });
      RecipeList.belongsToMany(models.ShoppingList, {
        through: models.ShoppingListRecipeList,
        foreignKey: "recipeListId",
        otherKey: "shoppingListId",
        as: "shoppingLists",
      });
    }
  }
  RecipeList.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      listName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RecipeList",
      tableName: "RecipeLists",
    },
  );
  return RecipeList;
};

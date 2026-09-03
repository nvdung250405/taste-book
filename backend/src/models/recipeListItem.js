"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RecipeListItem extends Model {
    static associate(models) {
      RecipeListItem.belongsTo(models.RecipeList, { foreignKey: "recipeListId", as: "recipeList" });
      RecipeListItem.belongsTo(models.Recipe, { foreignKey: "recipeId", as: "recipe" });
    }
  }
  RecipeListItem.init(
    {
      recipeListId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetServings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
    },
    {
      sequelize,
      modelName: "RecipeListItem",
      tableName: "RecipeListItems",
    },
  );
  return RecipeListItem;
};

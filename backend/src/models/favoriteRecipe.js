"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FavoriteRecipe extends Model {
    static associate(models) {
      FavoriteRecipe.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      FavoriteRecipe.belongsTo(models.Recipe, { foreignKey: "recipeId", as: "recipe" });
    }
  }
  FavoriteRecipe.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      personalNotes: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "FavoriteRecipe",
      tableName: "FavoriteRecipes",
    },
  );
  return FavoriteRecipe;
};

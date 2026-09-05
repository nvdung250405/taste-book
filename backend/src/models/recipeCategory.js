"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RecipeCategory extends Model {
    static associate(models) {
      RecipeCategory.belongsTo(models.Recipe, { foreignKey: "recipeId" });
      RecipeCategory.belongsTo(models.Category, { foreignKey: "categoryId" });
    }
  }
  RecipeCategory.init(
    {
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "RecipeCategory",
      tableName: "RecipeCategories",
      timestamps: false,
    },
  );
  return RecipeCategory;
};

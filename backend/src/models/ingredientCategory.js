"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class IngredientCategory extends Model {
    static associate(models) {
      IngredientCategory.hasMany(models.Ingredient, {
        foreignKey: "ingredientCategoryId",
        as: "ingredients",
      });
    }
  }
  IngredientCategory.init(
    {
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "IngredientCategory",
      tableName: "IngredientCategories",
    },
  );
  return IngredientCategory;
};

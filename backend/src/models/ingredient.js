"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    static associate(models) {
      Ingredient.hasMany(models.RecipeIngredient, { foreignKey: "ingredientId", as: "recipeIngredients" });
      Ingredient.hasMany(models.ShoppingListItem, { foreignKey: "ingredientId", as: "shoppingListItems" });
      Ingredient.belongsTo(models.IngredientCategory, { foreignKey: "ingredientCategoryId", as: "categoryGroup" });
      Ingredient.belongsTo(models.Unit, { foreignKey: "defaultUnitId", as: "defaultUnit" });
    }
  }
  Ingredient.init(
    {
      ingredientName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ingredientCategoryId: {
        type: DataTypes.INTEGER,
      },
      defaultUnitId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Ingredient",
      tableName: "Ingredients",
    },
  );
  return Ingredient;
};

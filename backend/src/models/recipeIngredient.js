"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RecipeIngredient extends Model {
    static associate(models) {
      RecipeIngredient.belongsTo(models.Recipe, { foreignKey: "recipeId", as: "recipe" });
      RecipeIngredient.belongsTo(models.Ingredient, { foreignKey: "ingredientId", as: "ingredient" });
      RecipeIngredient.belongsTo(models.Unit, { foreignKey: "unitId", as: "unitGroup" });
    }
  }
  RecipeIngredient.init(
    {
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ingredientId: {
        type: DataTypes.INTEGER,
      },
      customIngredientName: {
        type: DataTypes.STRING,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      unitId: {
        type: DataTypes.INTEGER,
      },
      customUnit: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "RecipeIngredient",
      tableName: "RecipeIngredients",
      validate: {
        ingredientOrCustom() {
          if (!this.ingredientId && !this.customIngredientName) {
            throw new Error("Must provide either ingredientId or customIngredientName");
          }
        },
      },
    },
  );
  return RecipeIngredient;
};

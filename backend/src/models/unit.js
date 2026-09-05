"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      Unit.hasMany(models.RecipeIngredient, {
        foreignKey: "unitId",
        as: "recipeIngredients",
      });
      Unit.hasMany(models.Ingredient, {
        foreignKey: "defaultUnitId",
        as: "ingredients",
      });
    }
  }
  Unit.init(
    {
      unitName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Unit",
      tableName: "Units",
    },
  );
  return Unit;
};

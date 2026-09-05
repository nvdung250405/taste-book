"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CookingStep extends Model {
    static associate(models) {
      CookingStep.belongsTo(models.Recipe, { foreignKey: "recipeId", as: "recipe" });
    }
  }
  CookingStep.init(
    {
      recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stepNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      instruction: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CookingStep",
      tableName: "CookingSteps",
    },
  );
  return CookingStep;
};

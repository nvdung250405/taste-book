"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.User, { foreignKey: "createdBy", as: "creator" });
      Category.belongsToMany(models.Recipe, {
        through: models.RecipeCategory,
        foreignKey: "categoryId",
        otherKey: "recipeId",
        as: "recipes",
      });
    }
  }
  Category.init(
    {
      categoryName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
    },
  );
  return Category;
};

"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    static associate(models) {
      Recipe.belongsTo(models.User, { foreignKey: "authorId", as: "author" });
      Recipe.belongsToMany(models.Category, {
        through: models.RecipeCategory,
        foreignKey: "recipeId",
        otherKey: "categoryId",
        as: "categories",
      });
      Recipe.hasMany(models.RecipeIngredient, {
        foreignKey: "recipeId",
        as: "ingredients",
      });
      Recipe.hasMany(models.CookingStep, {
        foreignKey: "recipeId",
        as: "cookingSteps",
      });
      Recipe.hasMany(models.FavoriteRecipe, {
        foreignKey: "recipeId",
        as: "favoritedBy",
      });
      Recipe.hasMany(models.RecipeListItem, {
        foreignKey: "recipeId",
        as: "recipeListItems",
      });
    }
  }
  Recipe.init(
    {
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      thumbnailUrl: DataTypes.TEXT,
      cookTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      difficulty: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Easy",
        validate: {
          isIn: [["Easy", "Medium", "Hard"]],
        },
      },
      defaultServings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvalStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
        validate: {
          isIn: [["Pending", "Approved", "Rejected"]],
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rejectionReason: {
        type: DataTypes.TEXT,
      },
      pendingUpdateData: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Recipe",
      tableName: "Recipes",
    },
  );
  return Recipe;
};

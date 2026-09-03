"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Category, {
        foreignKey: "createdBy",
        as: "createdCategories",
      });
      User.hasMany(models.Recipe, { foreignKey: "authorId", as: "recipes" });
      User.hasMany(models.RecipeList, {
        foreignKey: "userId",
        as: "recipeLists",
      });
      User.hasMany(models.ShoppingList, {
        foreignKey: "userId",
        as: "shoppingLists",
      });
      User.hasMany(models.FavoriteRecipe, {
        foreignKey: "userId",
        as: "favorites",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      avatarUrl: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "User",
        validate: {
          isIn: [["User", "Admin"]],
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users", // Chỉ định rõ tên bảng trong DB là Users (số nhiều)
    },
  );
  return User;
};

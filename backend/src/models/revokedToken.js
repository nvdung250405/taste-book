"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RevokedToken extends Model {
    static associate(models) {
      RevokedToken.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }
  RevokedToken.init({
    tokenHash: { type: DataTypes.STRING(64), primaryKey: true, allowNull: false },
    jti: { type: DataTypes.STRING, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  }, { sequelize, modelName: "RevokedToken", tableName: "RevokedTokens" });
  return RevokedToken;
};

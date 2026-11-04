"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("RevokedTokens", {
      tokenHash: { type: Sequelize.STRING(64), primaryKey: true, allowNull: false },
      jti: { type: Sequelize.STRING, allowNull: true },
      userId: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE", onDelete: "CASCADE",
      },
      expiresAt: { type: Sequelize.DATE, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("RevokedTokens", ["expiresAt"], { name: "IX_RevokedTokens_ExpiresAt" });
  },
  down: async queryInterface => queryInterface.dropTable("RevokedTokens"),
};

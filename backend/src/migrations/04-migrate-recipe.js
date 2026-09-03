"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Recipes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      thumbnailUrl: {
        type: Sequelize.TEXT,
      },
      cookTimeMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      difficulty: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Easy",
      },
      defaultServings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 2,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvalStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      rejectionReason: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Recipes", ["isDeleted", "isPublic", "approvalStatus"], {
      name: "IX_Recipes_Public_Approved",
    });
    await queryInterface.addIndex("Recipes", ["authorId"], {
      name: "IX_Recipes_AuthorId",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Recipes");
  },
};

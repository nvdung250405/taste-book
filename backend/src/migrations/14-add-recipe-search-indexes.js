"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex("RecipeIngredients", ["ingredientId", "recipeId"], {
        name: "IX_RecipeIngredients_IngredientId_RecipeId", transaction,
      });
      await queryInterface.addIndex("RecipeCategories", ["categoryId", "recipeId"], {
        name: "IX_RecipeCategories_CategoryId_RecipeId", transaction,
      });
    });
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex("RecipeCategories", "IX_RecipeCategories_CategoryId_RecipeId", { transaction });
      await queryInterface.removeIndex("RecipeIngredients", "IX_RecipeIngredients_IngredientId_RecipeId", { transaction });
    });
  },
};

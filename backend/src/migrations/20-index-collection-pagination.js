"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE INDEX "IX_Recipes_Public_CreatedAt_Id" ON "Recipes" ("createdAt" DESC, "id" DESC)
          WHERE "isPublic" = TRUE AND "approvalStatus" = 'Approved' AND "isDeleted" = FALSE;
        CREATE INDEX "IX_FavoriteRecipes_User_CreatedAt_Recipe" ON "FavoriteRecipes" ("userId", "createdAt" DESC, "recipeId" DESC);
        CREATE INDEX "IX_RecipeLists_User_CreatedAt" ON "RecipeLists" ("userId", "createdAt" DESC);
      `, { transaction });
    });
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        DROP INDEX "IX_RecipeLists_User_CreatedAt";
        DROP INDEX "IX_FavoriteRecipes_User_CreatedAt_Recipe";
        DROP INDEX "IX_Recipes_Public_CreatedAt_Id";
      `, { transaction });
    });
  },
};

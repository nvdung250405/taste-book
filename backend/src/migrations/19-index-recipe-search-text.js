"use strict";

const fields = [
  ["Recipes", "title", "searchTitle"],
  ["Ingredients", "ingredientName", "searchIngredientName"],
  ["RecipeIngredients", "customIngredientName", "searchCustomIngredientName"],
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const run = (sql) => queryInterface.sequelize.query(sql, { transaction });
      await run("CREATE EXTENSION IF NOT EXISTS unaccent");
      await run("CREATE EXTENSION IF NOT EXISTS pg_trgm");
      for (const [table, source, target] of fields) {
        await run(`ALTER TABLE "${table}" ADD COLUMN "${target}" TEXT`);
        // Persist normalized text rather than incorrectly declaring unaccent IMMUTABLE.
        await run(`CREATE FUNCTION "tb_search_${table}"() RETURNS trigger LANGUAGE plpgsql AS $fn$
          BEGIN NEW."${target}" := unaccent(NEW."${source}"); RETURN NEW; END; $fn$`);
        await run(`CREATE TRIGGER "TR_${table}_SearchText" BEFORE INSERT OR UPDATE ON "${table}"
          FOR EACH ROW EXECUTE FUNCTION "tb_search_${table}"()`);
        await run(`UPDATE "${table}" SET "${target}" = unaccent("${source}")`);
        await run(`CREATE INDEX "IX_${table}_SearchText_Trgm" ON "${table}" USING gin ("${target}" gin_trgm_ops)`);
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      for (const [table, , target] of [...fields].reverse()) {
        await queryInterface.sequelize.query(`DROP TRIGGER "TR_${table}_SearchText" ON "${table}";
          DROP FUNCTION "tb_search_${table}"();
          ALTER TABLE "${table}" DROP COLUMN "${target}";`, { transaction });
      }
      // Extensions may be shared by other application features; keep them installed.
    });
  },
};

// Validate migrations 19/20 on temporary tables, including backfill and rollback.
const assert = require("node:assert/strict");
const db = require("../src/models");
const searchMigration = require("../src/migrations/19-index-recipe-search-text");
const paginationMigration = require("../src/migrations/20-index-collection-pagination");

const verify = async () => {
  assert.equal(process.env.NODE_ENV, "test");
  assert.match(process.env.DB_NAME_TEST || "", /_test$/i);
  const transaction = await db.sequelize.transaction();
  const run = (sql) => db.sequelize.query(sql, { transaction });
  const adapter = { sequelize: {
    transaction: (callback) => callback(transaction),
    // Isolate function names as well as the TEMP relations.
    query: (sql) => run(sql.replaceAll('"tb_search_', '"verify_tb_search_')),
  } };
  try {
    await run(`CREATE TEMP TABLE "Recipes" (id INT, title TEXT, "createdAt" TIMESTAMPTZ, "isPublic" BOOLEAN, "approvalStatus" TEXT, "isDeleted" BOOLEAN) ON COMMIT DROP;
      CREATE TEMP TABLE "Ingredients" (id INT, "ingredientName" TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "RecipeIngredients" (id INT, "customIngredientName" TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "FavoriteRecipes" ("userId" INT, "recipeId" INT, "createdAt" TIMESTAMPTZ) ON COMMIT DROP;
      CREATE TEMP TABLE "RecipeLists" ("userId" INT, "createdAt" TIMESTAMPTZ) ON COMMIT DROP;
      INSERT INTO "Recipes" (id,title) VALUES (1,'Phở bò');
      INSERT INTO "Ingredients" VALUES (1,'Thịt bò');
      INSERT INTO "RecipeIngredients" VALUES (1,'Nước mắm'),(2,NULL);`);
    await searchMigration.up(adapter);
    await paginationMigration.up(adapter);
    const [[indexCount]] = await run("SELECT COUNT(*) AS count FROM pg_indexes WHERE schemaname = (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema())");
    assert.equal(Number(indexCount.count),6);
    const [[recipe]] = await run('SELECT "searchTitle" FROM "Recipes" WHERE id=1');
    assert.equal(recipe.searchTitle, "Pho bo");
    const [[ingredient]] = await run('SELECT "searchIngredientName" FROM "Ingredients" WHERE id=1');
    assert.equal(ingredient.searchIngredientName, "Thit bo");
    const [custom] = await run('SELECT "searchCustomIngredientName" FROM "RecipeIngredients" ORDER BY id');
    assert.deepEqual(custom.map((row) => row.searchCustomIngredientName), ["Nuoc mam", null]);
    await run(`UPDATE "Recipes" SET title='Bánh xèo', "searchTitle"='incorrect' WHERE id=1;
      INSERT INTO "Ingredients" VALUES (2,'Đậu phụ',NULL);
      UPDATE "RecipeIngredients" SET "customIngredientName"='Tỏi' WHERE id=1;`);
    const [[updated]] = await run('SELECT "searchTitle" FROM "Recipes" WHERE id=1');
    assert.equal(updated.searchTitle, "Banh xeo");
    const [[inserted]] = await run('SELECT "searchIngredientName" FROM "Ingredients" WHERE id=2');
    assert.equal(inserted.searchIngredientName, "Dau phu");
    const [[updatedCustom]] = await run('SELECT "searchCustomIngredientName" FROM "RecipeIngredients" WHERE id=1');
    assert.equal(updatedCustom.searchCustomIngredientName, "Toi");
    await paginationMigration.down(adapter);
    await searchMigration.down(adapter);
    const [[remainingIndexes]] = await run("SELECT COUNT(*) AS count FROM pg_indexes WHERE schemaname = (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema())");
    assert.equal(Number(remainingIndexes.count),0);
    const [[restored]] = await run('SELECT * FROM "Recipes" WHERE id=1');
    assert.equal(restored.title, "Bánh xèo");
    assert.ok(!Object.hasOwn(restored, "searchTitle"));
    await searchMigration.up(adapter);
    await paginationMigration.up(adapter);
    console.log("PASS: migrations up/down/up, existing-data backfill, insert/update/null triggers, pagination indexes; TEMP only");
  } finally {
    await transaction.rollback();
  }
};
verify().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.sequelize.close());

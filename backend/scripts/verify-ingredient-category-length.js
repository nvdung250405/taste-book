// Run: npx babel-node scripts/verify-ingredient-category-length.js
// Use temporary tables in a transaction that is always rolled back.
import assert from "node:assert/strict";
import db from "../src/models/index";
import ingredientController from "../src/controllers/ingredientController";

const migration = require("../src/migrations/15-expand-ingredient-category-name");

const verify = async () => {
  const transaction = await db.sequelize.transaction();
  const originalTransaction = db.sequelize.transaction;
  const commit = transaction.commit.bind(transaction);
  const rollback = transaction.rollback.bind(transaction);
  const run = (sql, options = {}) => db.sequelize.query(sql, { ...options, transaction });
  try {
    await run("CREATE EXTENSION IF NOT EXISTS unaccent");
    await run(`CREATE TEMP TABLE "IngredientCategories" (
      id SERIAL PRIMARY KEY,
      "categoryName" VARCHAR(100) NOT NULL UNIQUE,
      "createdAt" TIMESTAMPTZ NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL
    ) ON COMMIT DROP`);
    await run(`INSERT INTO "IngredientCategories" VALUES (0, 'Existing group', NOW(), NOW())`);

    for (const length of [254, 255]) {
      await run("SAVEPOINT before_invalid_insert");
      await assert.rejects(
        db.IngredientCategory.create({ categoryName: "N".repeat(length) }, { transaction }),
        (error) => error.original?.code === "22001",
      );
      await run("ROLLBACK TO SAVEPOINT before_invalid_insert");
      await run("RELEASE SAVEPOINT before_invalid_insert");
      console.log(`Before migration: PostgreSQL rejects ${length} characters (22001).`);
    }

    const queryInterface = db.sequelize.getQueryInterface();
    const scopedInterface = {
      changeColumn: (table, column, definition) => queryInterface.changeColumn(
        table, column, definition, { transaction },
      ),
    };
    await migration.up(scopedInterface, db.Sequelize);

    // Keep controller/service queries on the connection holding the temporary table.
    // The outer transaction owns cleanup; service commits/rollbacks are suppressed.
    db.sequelize.transaction = async () => transaction;
    transaction.commit = async () => {};
    transaction.rollback = async () => {};

    for (const [testCase, length, status, ec] of [
      ["TC-22-17", 254, 201, 0],
      ["TC-22-20", 255, 201, 0],
      ["over-limit regression", 256, 400, 1],
    ]) {
      const categoryName = "N".repeat(length);
      const response = {
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = body; return this; },
      };
      await ingredientController.handleAdminCreateIngredientCategory({ body: { categoryName } }, response);
      assert.equal(response.statusCode, status, testCase);
      assert.equal(response.body.EC, ec, testCase);
      const stored = await db.IngredientCategory.findOne({ where: { categoryName }, transaction });
      if (ec === 0) {
        assert.equal(response.body.DT.categoryName, categoryName);
        assert.equal(stored.categoryName, categoryName);
      } else {
        assert.equal(stored, null);
      }
      console.log(`PASS ${testCase}: ${length} characters, HTTP ${status}, EC ${ec}, verified in PostgreSQL.`);
    }

    assert.equal((await db.IngredientCategory.findByPk(0, { transaction })).categoryName, "Existing group");
    await run("SAVEPOINT duplicate_check");
    await assert.rejects(
      db.IngredientCategory.create({ categoryName: "Existing group" }, { transaction }),
      (error) => error.original?.code === "23505",
    );
    await run("ROLLBACK TO SAVEPOINT duplicate_check");
    await run("RELEASE SAVEPOINT duplicate_check");
    console.log("PASS existing data and unique constraint preserved.");

    await run('DELETE FROM "IngredientCategories" WHERE id <> 0');
    await migration.down(scopedInterface, db.Sequelize);
    const [columns] = await run(`SELECT atttypmod - 4 AS length FROM pg_attribute
      WHERE attrelid = 'pg_temp."IngredientCategories"'::regclass AND attname = 'categoryName'`);
    assert.equal(columns[0].length, 100);
    console.log("PASS down migration restores 100 characters after long test names are removed.");
  } finally {
    db.sequelize.transaction = originalTransaction;
    transaction.commit = commit;
    transaction.rollback = rollback;
    await rollback();
  }
};

verify()
  .catch((error) => {
    console.error("Ingredient category verification failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => db.sequelize.close());

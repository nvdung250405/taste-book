// Chạy bằng: npx babel-node scripts/verify-recipe-search.js
// Chỉ dùng bảng TEMP trong một transaction luôn rollback; không sửa dữ liệu ứng dụng.
import assert from "node:assert/strict";
import db from "../src/models/index";
import recipeService from "../src/services/recipeService";
const migration = require("../src/migrations/14-add-recipe-search-indexes");

const verify = async () => {
  const transaction = await db.sequelize.transaction();
  const query = db.sequelize.query.bind(db.sequelize);
  const originalFind = db.Recipe.findAndCountAll;
  const statements = [];
  try {
    const run = (sql, options = {}) => query(sql, { ...options, transaction });
    // unaccent là extension ứng dụng đã dùng; rollback cả việc cài nếu chưa có.
    await run("CREATE EXTENSION IF NOT EXISTS unaccent");
    await run(`
      CREATE TEMP TABLE "Recipes" (
        id INTEGER PRIMARY KEY, "authorId" INTEGER, title TEXT, description TEXT,
        "thumbnailUrl" TEXT, "cookTimeMinutes" INTEGER DEFAULT 15,
        difficulty TEXT DEFAULT 'Easy', "defaultServings" INTEGER DEFAULT 2,
        "isPublic" BOOLEAN DEFAULT true, "approvalStatus" TEXT DEFAULT 'Approved',
        "isDeleted" BOOLEAN DEFAULT false, "rejectionReason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(), "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      ) ON COMMIT DROP;
      CREATE TEMP TABLE "Users" (id INTEGER, username TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "Categories" (id INTEGER, "categoryName" TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "RecipeCategories" ("recipeId" INTEGER, "categoryId" INTEGER) ON COMMIT DROP;
      CREATE TEMP TABLE "Ingredients" (id INTEGER, "ingredientName" TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "RecipeIngredients" ("recipeId" INTEGER, "ingredientId" INTEGER, "customIngredientName" TEXT) ON COMMIT DROP;
      INSERT INTO "Users" VALUES (1, 'author');
      INSERT INTO "Categories" VALUES (1, 'Main'), (2, 'Other');
      INSERT INTO "Ingredients" VALUES (1, 'Thịt bò'), (2, 'Gà');
      INSERT INTO "Recipes" (id, "authorId", title) VALUES
        (1, 1, 'Bò kho'), (2, 1, 'Canh rau'), (3, 1, 'Món nhà'),
        (4, 1, 'Hidden'), (5, 1, 'Pending'), (6, 1, 'Deleted'), (7, 1, 'Empty');
      UPDATE "Recipes" SET "isPublic" = false WHERE id = 4;
      UPDATE "Recipes" SET "approvalStatus" = 'Pending' WHERE id = 5;
      UPDATE "Recipes" SET "isDeleted" = true WHERE id = 6;
      INSERT INTO "RecipeCategories" VALUES (1, 1), (1, 2), (2, 1), (3, 2), (4, 1), (5, 1), (6, 1);
      INSERT INTO "RecipeIngredients" VALUES
        (1, 2, NULL), (2, 1, NULL), (2, 1, NULL), (3, NULL, 'Bò viên'),
        (4, 1, NULL), (5, 1, NULL), (6, 1, NULL);
    `);

    // Inject transaction chỉ trong script để tất cả truy vấn dùng cùng bảng TEMP.
    db.Recipe.findAndCountAll = (options) => originalFind.call(db.Recipe, { ...options, transaction });
    db.sequelize.query = (sql, options) => {
      statements.push({ sql, bind: options?.bind });
      return query(sql, options);
    };
    const check = async (params, expectedIds, total = expectedIds.length) => {
      const start = statements.length;
      const result = await recipeService.getRecipes({ sortBy: "title", sortOrder: "ASC", limit: 100, ...params });
      assert.equal(result.EC, 0, result.EM);
      assert.deepEqual(result.DT.recipes.map((recipe) => recipe.recipeId), expectedIds);
      assert.equal(result.DT.total, total);
      assert.equal(statements.length - start, 2, "Chỉ COUNT và SELECT, không prefetch ID");
      return result;
    };
    await check({ keyword: "bò" }, [1, 2, 3]);
    await check({ keyword: "bo" }, [1, 2, 3]);
    await check({ search: "BO" }, [1, 2, 3]);
    await check({ keyword: "gà" }, [1]);
    await check({ keyword: "Bò viên" }, [3]);
    await check({ keyword: "missing" }, []);
    await check({ keyword: "x' OR 1=1 --" }, []);
    await check({ keyword: "$recipeSearchKeyword" }, []);
    await check({ keyword: "bo", categoryId: 1, ingredientId: 1 }, [2]);
    await check({ keyword: "bo", ingredientId: 2 }, [1]);
    await check({ categoryId: 2 }, [1, 3]);
    await check({ ingredientId: 1 }, [2]);
    await check({ keyword: "bo", page: 2, limit: 1 }, [2], 3);
    await check({ keyword: "bo", page: 9, limit: 1 }, [], 3);
    await check({ keyword: "bo", sortBy: "createdAt", page: 2, limit: 1 }, [2], 3);

    const realInterface = db.sequelize.getQueryInterface();
    const migrationInterface = {
      sequelize: { transaction: (callback) => callback(transaction) },
      addIndex: (...args) => realInterface.addIndex(...args),
      removeIndex: (...args) => realInterface.removeIndex(...args),
    };
    await migration.up(migrationInterface);
    const [indexes] = await run(`SELECT indexname FROM pg_indexes
      WHERE schemaname LIKE 'pg_temp_%' AND indexname IN (
        'IX_RecipeIngredients_IngredientId_RecipeId', 'IX_RecipeCategories_CategoryId_RecipeId')`);
    assert.equal(indexes.length, 2);
    await migration.down(migrationInterface);
    const [removed] = await run(`SELECT indexname FROM pg_indexes
      WHERE schemaname LIKE 'pg_temp_%' AND indexname IN (
        'IX_RecipeIngredients_IngredientId_RecipeId', 'IX_RecipeCategories_CategoryId_RecipeId')`);
    assert.equal(removed.length, 0);
    await migration.up(migrationInterface);

    // Dữ liệu lớn chỉ nằm trong bảng TEMP để kiểm chứng truy vấn không trả danh sách ID.
    await run(`INSERT INTO "Recipes" (id, "authorId", title)
      SELECT id, 1, 'Bulk ' || id FROM generate_series(100, 10099) id;
      INSERT INTO "RecipeIngredients" ("recipeId", "ingredientId")
      SELECT id, 1 FROM generate_series(100, 10099) id;
      INSERT INTO "RecipeCategories" SELECT id, 1 FROM generate_series(100, 10099) id;
      ANALYZE "Recipes"; ANALYZE "RecipeIngredients"; ANALYZE "RecipeCategories";`);
    const large = await check({ keyword: "bo", categoryId: 1, ingredientId: 1, limit: 10 },
      [100, 1000, 10000, 10001, 10002, 10003, 10004, 10005, 10006, 10007], 10001);
    assert.equal(large.DT.recipes.length, 10);
    const select = statements.filter(({ sql }) => /^SELECT "Recipe"\.\*/.test(sql)).at(-1);
    assert.ok(select, "Lấy SQL SELECT thực tế do Sequelize sinh");
    const [plan] = await run(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${select.sql}`, { bind: select.bind });
    const indexesUsed = new Set();
    const collectIndexes = (node) => {
      if (node["Index Name"]) indexesUsed.add(node["Index Name"]);
      for (const child of node.Plans || []) collectIndexes(child);
    };
    collectIndexes(plan[0]["QUERY PLAN"][0].Plan);
    console.log(JSON.stringify({
      checks: "16 search scenarios, migration up/down/up, 10,000 additional recipes",
      total: large.DT.total, returned: large.DT.recipes.length,
      executionTimeMs: plan[0]["QUERY PLAN"][0]["Execution Time"],
      indexesUsed: [...indexesUsed],
    }, null, 2));
  } finally {
    db.Recipe.findAndCountAll = originalFind;
    db.sequelize.query = query;
    await transaction.rollback();
  }
};

verify().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => db.sequelize.close());

// Run: npx babel-node scripts/verify-home-detail-queries.js
// Only temporary tables on an explicitly configured test database; always rollback.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Op, Sequelize } from "sequelize";
import homeService from "../src/services/homeService";
import recipeService from "../src/services/recipeService";
import db from "../src/models";

const verify = async () => {
  if (process.env.NODE_ENV !== "test" || !/_test$/i.test(process.env.DB_NAME_TEST || "")) {
    throw new Error("Set NODE_ENV=test and an explicit DB_NAME_TEST ending in _test.");
  }
  const config = require("../src/config/config").test;
  for (const name of [process.env.DB_DATABASE_NAME, process.env.DB_NAME, process.env.DB_NAME_PROD].filter(Boolean)) {
    assert.notEqual(name.toLowerCase(), config.database.toLowerCase(), "Use a separate test database");
  }
  const transaction = await db.sequelize.transaction();
  const originalQuery = db.sequelize.query.bind(db.sequelize);
  const statements = [];
  const run = (sql, options = {}) => originalQuery(sql, { ...options, transaction });
  const capture = async (operation) => {
    statements.length = 0;
    const value = await operation();
    return { value, statements: [...statements] };
  };
  const explain = async (queries) => {
    const result = [];
    for (const statement of queries) {
      const [rows] = await run(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${statement.sql}`, { bind: statement.bind });
      const plan = rows[0]["QUERY PLAN"][0];
      const subplans = [];
      const visit = (node) => {
        if (node["Subplan Name"]) subplans.push({ name: node["Subplan Name"], loops: node["Actual Loops"] });
        for (const child of node.Plans || []) visit(child);
      };
      visit(plan.Plan);
      result.push({ sql: statement.sql, bind: statement.bind,
        executionTimeMs: plan["Execution Time"], returnedRows: plan.Plan["Actual Rows"],
        subplans, plan });
    }
    return result;
  };
  try {
    const tables = ["Users", "Units", "Ingredients", "Categories", "Recipes", "RecipeCategories", "RecipeIngredients", "CookingSteps", "FavoriteRecipes"];
    for (const table of tables) {
      await run(`CREATE TEMP TABLE "${table}" (LIKE public."${table}" INCLUDING ALL) ON COMMIT DROP`);
    }
    await run(`
      INSERT INTO "Users" (id, username, email, password, phone, role, "createdAt", "updatedAt")
        SELECT id, 'User ' || id, id || '@example.test', 'fixture', '090000000' || id, 'User', NOW(), NOW() FROM generate_series(1,2) id;
      INSERT INTO "Units" (id, "unitName", "createdAt", "updatedAt") VALUES (1,'g',NOW(),NOW());
      INSERT INTO "Ingredients" (id, "ingredientName", "defaultUnitId", "createdAt", "updatedAt")
        SELECT id, 'Ingredient ' || id, 1, NOW(), NOW() FROM generate_series(1,20) id;
      INSERT INTO "Categories" (id, "categoryName", "createdBy", "createdAt", "updatedAt")
        VALUES (1,'System A',NULL,NOW(),NOW()), (2,'System B',NULL,NOW(),NOW()),
               (3,'Owner category',1,NOW(),NOW()), (4,'Other category',2,NOW(),NOW());
      INSERT INTO "Recipes" (id,"authorId",title,description,"cookTimeMinutes",difficulty,"defaultServings","isPublic","approvalStatus","isDeleted","createdAt","updatedAt")
        SELECT id,1,'Recipe ' || id,'Fixture',30,'Easy',4,TRUE,'Approved',FALSE,NOW(),NOW() FROM generate_series(1,10000) id;
      UPDATE "Recipes" SET "isPublic"=FALSE WHERE id=3;
      UPDATE "Recipes" SET "approvalStatus"='Pending' WHERE id=4;
      UPDATE "Recipes" SET "isDeleted"=TRUE WHERE id=5;
      INSERT INTO "RecipeCategories" ("recipeId","categoryId") SELECT id,1 FROM generate_series(1,10000) id;
      INSERT INTO "RecipeCategories" ("recipeId","categoryId") VALUES (1,2),(1,3),(1,4);
      INSERT INTO "RecipeIngredients" (id,"recipeId","ingredientId",quantity,"unitId","createdAt","updatedAt")
        SELECT id,1,id,100,1,NOW(),NOW() FROM generate_series(1,20) id;
      INSERT INTO "CookingSteps" (id,"recipeId","stepNumber",instruction,"createdAt","updatedAt")
        SELECT id,1,id,'Step ' || id,NOW(),NOW() FROM generate_series(1,12) id;
      INSERT INTO "FavoriteRecipes" ("userId","recipeId","createdAt","updatedAt")
        SELECT 1,id,NOW(),NOW() FROM generate_series(1,9999) id;
      INSERT INTO "FavoriteRecipes" ("userId","recipeId","createdAt","updatedAt") VALUES (2,1,NOW(),NOW()),(2,2,NOW(),NOW());
    `);
    for (const table of tables) await run(`ANALYZE "${table}"`);
    db.sequelize.query = (sql, options = {}) => {
      if (typeof sql === "string" && /^SELECT/i.test(sql.trim())) statements.push({ sql, bind: options.bind });
      return originalQuery(sql, { ...options, transaction });
    };

    const visibility = { isPublic: true, approvalStatus: "Approved", isDeleted: false };
    const commonInclude = [
      { model: db.User, as: "author", attributes: ["id", "username"] },
      { model: db.Category, as: "categories", attributes: ["id", "categoryName"], through: { attributes: [] }, where: { createdBy: null }, required: false },
    ];
    const count = '(SELECT COUNT(*) FROM "FavoriteRecipes" WHERE "FavoriteRecipes"."recipeId" = "Recipe"."id")';
    const beforeTrending = await capture(() => db.Recipe.findAll({
      where: { ...visibility, [Op.and]: [Sequelize.literal(`${count} > 0`)] },
      attributes: ["id", "title", "thumbnailUrl", "cookTimeMinutes", "difficulty", "defaultServings", "createdAt", "updatedAt", [Sequelize.literal(count), "favoriteCount"]],
      include: commonInclude, order: [[Sequelize.literal('"favoriteCount"'), "DESC"], ["updatedAt", "DESC"]], limit: 6,
    }));
    const beforeDetail = await capture(() => db.Recipe.findOne({
      where: { id: 1, isDeleted: false },
      include: [commonInclude[0], { ...commonInclude[1], where: undefined, attributes: ["id", "categoryName", "createdBy"] },
        { model: db.RecipeIngredient, as: "ingredients", include: [
          { model: db.Ingredient, as: "ingredient", attributes: ["id", "ingredientName"] },
          { model: db.Unit, as: "unitGroup", attributes: ["id", "unitName"] },
        ] },
        { model: db.CookingStep, as: "cookingSteps", attributes: ["id", "stepNumber", "instruction"] }],
      order: [[{ model: db.CookingStep, as: "cookingSteps" }, "stepNumber", "ASC"], [{ model: db.RecipeIngredient, as: "ingredients" }, "id", "ASC"]],
    }));
    const afterHome = await capture(() => homeService.getHomeData({ limit: 6 }));
    assert.equal(afterHome.value.EC, 0);
    const trending = afterHome.value.DT.trendingRecipes;
    assert.deepEqual(trending.map((row) => row.recipeId), [2,1,9999,9998,9997,9996]);
    assert.deepEqual(trending.map((row) => row.favoriteCount), [2,2,1,1,1,1]);
    assert.deepEqual(trending.find((row) => row.recipeId === 1).categories.map((row) => row.categoryId).sort(), [1,2]);
    assert.equal(beforeTrending.value.length, trending.length);
    const afterDetail = await capture(() => recipeService.getRecipeById(1, 1, "User"));
    assert.equal(afterDetail.value.EC, 0);
    assert.equal(afterDetail.value.DT.ingredients.length, 20);
    assert.deepEqual(afterDetail.value.DT.steps.map((row) => row.stepNumber), Array.from({ length: 12 }, (_, index) => index + 1));
    assert.equal(afterDetail.value.DT.categories.length, 3);
    assert.equal(beforeDetail.value.ingredients.length, afterDetail.value.DT.ingredients.length);
    assert.deepEqual(afterDetail.value.DT.ingredients.map((item) => ({
      ingredientId: item.ingredientId, quantity: item.quantity, unit: item.unit,
    })), beforeDetail.value.ingredients.map((item) => ({
      ingredientId: item.ingredientId, quantity: Number(item.quantity), unit: item.unitGroup.unitName,
    })));
    assert.equal((await recipeService.getRecipeById(3)).EC, 3);
    assert.equal((await recipeService.getRecipeById(4)).EC, 3);
    assert.equal((await recipeService.getRecipeById(5)).EC, 3);
    assert.equal((await recipeService.getRecipeById(3, 1, "User")).EC, 0);
    assert.equal((await recipeService.getRecipeById(1)).DT.categories.length, 2);
    const trendingQueries = afterHome.statements.filter((statement) => !/ORDER BY "Recipe"\."updatedAt" DESC, "Recipe"\."createdAt" DESC/.test(statement.sql));
    const report = {
      measuredAt: new Date().toISOString(), environment: "Test DB, temporary tables, EXPLAIN ANALYZE BUFFERS; not Production/API latency",
      dataset: { recipes: 10000, favorites: 10001, detail: { categories: 4, ingredients: 20, steps: 12 } },
      beforeTrending: await explain(beforeTrending.statements), afterTrending: await explain(trendingQueries),
      beforeDetail: await explain(beforeDetail.statements), afterDetail: await explain(afterDetail.statements),
    };
    assert.equal(report.beforeDetail[0].returnedRows, 960);
    assert.equal(report.afterDetail.reduce((sum, row) => sum + row.returnedRows, 0), 36);
    assert.ok(report.beforeTrending.some((row) => row.subplans.length > 0));
    assert.ok(report.afterTrending.every((row) => row.subplans.length === 0));
    await run('DELETE FROM "FavoriteRecipes"');
    const emptyHome = await homeService.getHomeData({ limit: 6 });
    assert.equal(emptyHome.EC, 0);
    assert.equal(emptyHome.DT.trendingRecipes.length, 0);
    assert.equal(emptyHome.DT.latestRecipes.length, 6);
    fs.mkdirSync(path.resolve(__dirname, "../reports"), { recursive: true });
    fs.writeFileSync(path.resolve(__dirname, "../reports/home-detail-query-plans.json"), JSON.stringify(report, null, 2));
    for (const key of ["beforeTrending", "afterTrending", "beforeDetail", "afterDetail"]) {
      console.log(key, { queries: report[key].length,
        sqlMs: report[key].reduce((sum, row) => sum + row.executionTimeMs, 0),
        rows: report[key].reduce((sum, row) => sum + row.returnedRows, 0),
        subplans: report[key].flatMap((row) => row.subplans) });
    }
  } finally {
    db.sequelize.query = originalQuery;
    await transaction.rollback();
  }
};

verify().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.sequelize.close());

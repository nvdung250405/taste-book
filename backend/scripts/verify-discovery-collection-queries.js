// NODE_ENV=test npx babel-node scripts/verify-discovery-collection-queries.js
// Real SQL against TEMP tables, with plans before/after; never application seed/reset.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { Op, Sequelize } from "sequelize";
import db from "../src/models";
import recipeService from "../src/services/recipeService";
import favoriteService from "../src/services/favoriteService";
import recipeListService from "../src/services/recipeListService";
import shoppingListService from "../src/services/shoppingListService";

const verify = async () => {
  assert.equal(process.env.NODE_ENV, "test");
  assert.match(process.env.DB_NAME_TEST || "", /_test$/i);
  for (const name of [process.env.DB_DATABASE_NAME, process.env.DB_NAME, process.env.DB_NAME_PROD].filter(Boolean)) {
    assert.notEqual(name.toLowerCase(), process.env.DB_NAME_TEST.toLowerCase());
  }
  const transaction = await db.sequelize.transaction();
  const query = db.sequelize.query.bind(db.sequelize);
  const originalTransaction = db.sequelize.transaction;
  const run = (sql, options = {}) => query(sql, { ...options, transaction });
  let statements = [];
  const capture = async (operation) => {
    statements = [];
    const value = await operation();
    return { value, statements: [...statements] };
  };
  const explain = async (queries) => {
    const results = [];
    for (const entry of queries) {
      const [rows] = await run(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${entry.sql}`, { bind: entry.bind });
      const plan = rows[0]["QUERY PLAN"][0];
      const indexes = [];
      const visit = (node) => { if (node["Index Name"]) indexes.push(node["Index Name"]); for (const child of node.Plans || []) visit(child); };
      visit(plan.Plan);
      results.push({ ...entry, executionTimeMs: plan["Execution Time"], returnedRows: plan.Plan["Actual Rows"], indexes, plan });
    }
    return results;
  };
  try {
    const models = [db.User, db.Unit, db.Ingredient, db.Category, db.Recipe, db.RecipeCategory,
      db.RecipeIngredient, db.CookingStep, db.FavoriteRecipe, db.RecipeList, db.RecipeListItem,
      db.ShoppingList, db.ShoppingListItem, db.ShoppingListRecipeList];
    for (const model of models) {
      const table = model.tableName;
      await run(`CREATE TEMP TABLE "${table}" (LIKE public."${table}" INCLUDING ALL) ON COMMIT DROP`);
      if (model.getAttributes().id) {
        await run(`CREATE TEMP SEQUENCE "seq_${table}" START 1000001;
          ALTER TABLE "${table}" ALTER COLUMN id SET DEFAULT nextval('pg_temp."seq_${table}"');`);
      }
    }
    // Remove copies of the new indexes to measure the legacy plans first.
    const [indexes] = await run("SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname = (SELECT nspname FROM pg_namespace WHERE oid = pg_my_temp_schema())");
    for (const index of indexes) {
      if (index.indexdef.includes("USING gin") ||
        (index.tablename === "Recipes" && index.indexdef.includes("WHERE") && index.indexdef.includes('"createdAt"')) ||
        (["FavoriteRecipes", "RecipeLists"].includes(index.tablename) && index.indexdef.includes('"createdAt" DESC'))) {
        await run(`DROP INDEX "${index.indexname.replace(/"/g, '""')}"`);
      }
    }
    for (const table of ["Recipes", "Ingredients", "RecipeIngredients"]) {
      await run(`CREATE TRIGGER "test_search_${table}" BEFORE INSERT OR UPDATE ON "${table}"
        FOR EACH ROW EXECUTE FUNCTION "tb_search_${table}"()`);
    }
    await run(`
      INSERT INTO "Users" (id,username,email,password,phone,role,"createdAt","updatedAt")
        SELECT id,'Bếp '||id,id||'@example.test','fixture','090000000'||id,'User',NOW(),NOW() FROM generate_series(1,2) id;
      INSERT INTO "Units" (id,"unitName","createdAt","updatedAt") VALUES (1,'g',NOW(),NOW());
      INSERT INTO "Ingredients" (id,"ingredientName","defaultUnitId","createdAt","updatedAt")
        SELECT id,CASE WHEN id=1 THEN 'Thịt bò' ELSE 'Nguyên liệu '||id END,1,NOW(),NOW() FROM generate_series(1,200) id;
      INSERT INTO "Categories" (id,"categoryName","createdBy","createdAt","updatedAt")
        SELECT id,'Category '||id,NULL,NOW(),NOW() FROM generate_series(1,3) id;
      INSERT INTO "Recipes" (id,"authorId",title,description,"cookTimeMinutes",difficulty,"defaultServings","isPublic","approvalStatus","isDeleted","createdAt","updatedAt")
        SELECT id,1,CASE WHEN id%100=1 THEN 'Phở bò '||id ELSE 'Canh rau '||id END,repeat('Fixture description ',200),30,'Easy',4,TRUE,'Approved',FALSE,NOW(),NOW() FROM generate_series(1,10000) id;
      UPDATE "Recipes" SET "isDeleted"=TRUE WHERE id=5;
      INSERT INTO "RecipeCategories" ("recipeId","categoryId") SELECT r,c FROM generate_series(1,10000) r CROSS JOIN generate_series(1,3) c;
      INSERT INTO "RecipeIngredients" (id,"recipeId","ingredientId",quantity,"unitId","createdAt","updatedAt")
        SELECT (r-1)*4+j,r,(r%50)*4+j,100,1,NOW(),NOW() FROM generate_series(1,10000) r CROSS JOIN generate_series(1,4) j;
      INSERT INTO "FavoriteRecipes" ("userId","recipeId","personalNotes","createdAt","updatedAt")
        SELECT 1,id,'Favorite',NOW() - id * INTERVAL '1 second',NOW() FROM generate_series(1,3000) id;
      INSERT INTO "RecipeLists" (id,"userId","listName","createdAt","updatedAt")
        SELECT id,1,'Menu '||id,NOW()-id*INTERVAL '1 second',NOW() FROM generate_series(1,101) id;
      INSERT INTO "RecipeListItems" (id,"recipeListId","recipeId","targetServings","createdAt","updatedAt")
        SELECT (m-1)*50+r,m,r,CASE WHEN m%2=0 THEN 6 ELSE 2 END,NOW(),NOW() FROM generate_series(1,100) m CROSS JOIN generate_series(1,50) r;
    `);
    // Recipe 5 is intentionally deleted for search/favorites; omit it in shopping expectations.
    for (const model of models) await run(`ANALYZE "${model.tableName}"`);
    db.sequelize.query = (sql, options = {}) => {
      if (typeof sql === "string" && /^SELECT/i.test(sql.trim())) statements.push({ sql, bind: options.bind });
      return query(sql, { ...options, transaction });
    };
    // Keep the service's writes in the outer rollback transaction. This is SQL/functional
    // verification, not an API latency benchmark or a measurement of transaction commit.
    db.sequelize.transaction = async () => ({ commit: async () => {}, rollback: async () => {} });

    const include = [
      { model: db.User, as: "author", attributes: ["id", "username"] },
      { model: db.Category, as: "categories", attributes: ["id", "categoryName"], through: { attributes: [] }, where: { createdBy: null }, required: false },
    ];
    const visible = { isPublic: true, approvalStatus: "Approved", isDeleted: false };
    const oldSearch = (keyword) => db.Recipe.findAndCountAll({
      where: keyword ? { ...visible, [Op.or]: [
        Sequelize.where(Sequelize.fn("unaccent", Sequelize.col("Recipe.title")), { [Op.iLike]: Sequelize.fn("unaccent", `%${keyword}%`) }),
        Sequelize.literal(`EXISTS (SELECT 1 FROM "RecipeIngredients" ri LEFT JOIN "Ingredients" i ON i.id=ri."ingredientId"
          WHERE ri."recipeId"="Recipe".id AND (unaccent(ri."customIngredientName") ILIKE unaccent($keyword) OR unaccent(i."ingredientName") ILIKE unaccent($keyword)))`),
      ] } : visible,
      ...(keyword ? { bind: { keyword: `%${keyword}%` } } : {}),
      include, order: [["createdAt", "DESC"], ["id", "DESC"]], limit: 10, offset: 0, distinct: true,
    });
    const oldFavorite = (offset = 0) => db.FavoriteRecipe.findAndCountAll({ where: { userId: 1 },
      include: [{ model: db.Recipe, as: "recipe", where: { isDeleted: false }, attributes: ["id","title","thumbnailUrl","cookTimeMinutes","difficulty"],
        include: [{ model: db.User, as: "author", attributes: ["id","username"] }] }],
      order: [["createdAt","DESC"],["recipeId","DESC"]], limit: 10, offset });
    const oldMenus = () => db.RecipeList.findAll({ where: { userId: 1 },
      include: [{ model: db.RecipeListItem, as: "recipeListItems", attributes: ["id"] }], order: [["createdAt","DESC"]] });
    const oldShopping = () => db.RecipeList.findAll({ where: { id: { [Op.in]: Array.from({length:20},(_,i)=>i+1) } },
      include: [{ model: db.RecipeListItem, as: "recipeListItems", include: [{ model: db.Recipe, as: "recipe", required: false,
        include: [{ model: db.RecipeIngredient, as: "ingredients", include: [{ model: db.Ingredient, as: "ingredient" },{ model: db.Unit, as: "unitGroup" }] }] }] }] });
    const cases = [
      ["recipeList", await capture(() => oldSearch()), () => recipeService.getRecipes()],
      ["searchNoMatch", await capture(() => oldSearch("missingneedle")), () => recipeService.getRecipes({ keyword: "missingneedle" })],
      ["favorites", await capture(() => oldFavorite()), () => favoriteService.getUserFavorites(1,{page:1,limit:10})],
      ["favoritesDeepPage", await capture(() => oldFavorite(1000)), () => favoriteService.getUserFavorites(1,{page:101,limit:10})],
      ["menus", await capture(oldMenus), () => recipeListService.getRecipeLists(1)],
      ["shopping", await capture(oldShopping), () => shoppingListService.generateShoppingList(1,{title:"Plan verification",recipeListIds:Array.from({length:20},(_,i)=>i+1),confirmSkipDeleted:true})],
    ];
    const report = { measuredAt: new Date().toISOString(),
      environment: "TEMP tables, local PostgreSQL, EXPLAIN ANALYZE BUFFERS; SQL times only, not API p95",
      dataset: { recipes: 10000, recipeIngredients: 40000, categoriesPerRecipe: 3, favorites: 3000, menus: 101, menuItems: 5000 }, cases: {} };
    for (const [name, before] of cases) report.cases[name] = { before: await explain(before.statements) };

    await run(`CREATE INDEX test_recipe_order ON "Recipes" ("createdAt" DESC,id DESC) WHERE "isPublic"=TRUE AND "approvalStatus"='Approved' AND "isDeleted"=FALSE;
      CREATE INDEX test_favorite_order ON "FavoriteRecipes" ("userId","createdAt" DESC,"recipeId" DESC);
      CREATE INDEX test_menu_order ON "RecipeLists" ("userId","createdAt" DESC);
      CREATE INDEX test_recipe_text ON "Recipes" USING gin ("searchTitle" gin_trgm_ops);
      CREATE INDEX test_ingredient_text ON "Ingredients" USING gin ("searchIngredientName" gin_trgm_ops);
      CREATE INDEX test_custom_text ON "RecipeIngredients" USING gin ("searchCustomIngredientName" gin_trgm_ops);`);
    let shoppingReadOptions;
    for (const [name, , operation] of cases) {
      const after = await capture(async () => {
        if (name !== "shopping") return operation();
        const originalFind = db.RecipeList.findAll;
        db.RecipeList.findAll = (options) => {
          shoppingReadOptions = options;
          return originalFind.call(db.RecipeList, options);
        };
        try { return await operation(); } finally { db.RecipeList.findAll = originalFind; }
      });
      assert.equal(after.value.EC, 0, JSON.stringify(after.value));
      const readQueries = name === "shopping"
        ? after.statements.filter((entry) => !entry.sql.includes('FROM "ShoppingLists"'))
        : after.statements;
      report.cases[name].after = await explain(readQueries);
      if (name === "recipeList") assert.equal(after.value.DT.total,9999);
      if (name === "searchNoMatch") assert.equal(after.value.DT.total,0);
      if (name.startsWith("favorites")) assert.equal(after.value.DT.total,2999);
      if (name === "menus") {
        assert.equal(after.value.DT.length,101);
        assert.equal(after.value.DT.find((row)=>row.recipeListId===101).totalItems,0);
        assert.equal(after.value.DT.find((row)=>row.recipeListId===1).totalItems,50);
      }
      if (name === "shopping") {
        assert.equal(after.value.DT.totalItems,196); // Deleted recipe 5 removes its four unique ingredients.
        const items = await db.ShoppingListItem.findAll({ where: { shoppingListId: after.value.DT.shoppingListId } });
        assert.equal(items.length,196);
        assert.ok(items.every((row)=>Number(row.totalQuantity)===2000));
      }
    }
    for (const keyword of ["pho","phở"]) assert.equal((await recipeService.getRecipes({keyword})).DT.total,100);
    assert.equal((await recipeService.getRecipes({keyword:"thit bo"})).DT.total,200);
    // Trigger updates keep normalized text and its index correct after edits.
    await db.Recipe.update({title:"Bánh xèo mới"},{where:{id:1}});
    assert.equal((await recipeService.getRecipes({keyword:"banh xeo moi"})).DT.total,1);
    assert.equal((await recipeService.getRecipes({keyword:"bánh xèo mới"})).DT.total,1);
    assert.ok(report.cases.recipeList.after.some((entry) => entry.indexes.includes("test_recipe_order")));
    assert.ok(report.cases.searchNoMatch.after.some((entry) => entry.indexes.includes("test_recipe_text")));
    assert.ok(report.cases.favorites.after.some((entry) => entry.indexes.includes("test_favorite_order")));
    assert.equal(report.cases.menus.before[0].returnedRows,5001);
    assert.equal(report.cases.menus.after[0].returnedRows,101);
    assert.equal(report.cases.shopping.after.reduce((sum,entry)=>sum+entry.returnedRows,0),1200);
    // Read + ORM hydration: SQL time alone does not capture the cost of thousands
    // of duplicate JOIN rows. Alternate before/after on the same indexes and data.
    report.readBenchmarks = {};
    for (const [name, beforeRead, afterRead] of [
      ["menus", oldMenus, () => recipeListService.getRecipeLists(1)],
      ["shoppingRead", oldShopping, () => db.RecipeList.findAll({ ...shoppingReadOptions, transaction })],
    ]) {
      const samples = { before: [], after: [] };
      const operations = { before: beforeRead, after: afterRead };
      for (let index=0; index<23; index++) {
        for (const phase of index%2 ? ["before","after"] : ["after","before"]) {
          const start = performance.now();
          const value = await operations[phase]();
          const duration = performance.now()-start;
          if (name === "menus" && phase === "after") assert.equal(value.EC,0);
          else assert.equal(value.length,name === "menus" ? 101 : 20);
          if (index>=3) samples[phase].push(duration);
        }
      }
      report.readBenchmarks[name] = Object.fromEntries(Object.entries(samples).map(([phase,times])=>{
        const sorted=[...times].sort((a,b)=>a-b);
        return [phase,{samples:20,warmup:3,concurrency:1,p95Ms:sorted[18],maxMs:sorted[19],rawMs:times}];
      }));
    }
    fs.mkdirSync(path.resolve(__dirname,"../reports"),{recursive:true});
    fs.writeFileSync(path.resolve(__dirname,"../reports/discovery-collection-query-plans.json"),JSON.stringify(report,null,2));
    for (const [name,result] of Object.entries(report.cases)) {
      console.log(name, Object.fromEntries(Object.entries(result).map(([phase,plans])=>[phase,{
        sqlMs:plans.reduce((n,p)=>n+p.executionTimeMs,0),rows:plans.reduce((n,p)=>n+p.returnedRows,0),
        queries:plans.length,indexes:[...new Set(plans.flatMap((p)=>p.indexes))],
      }])));
    }
    console.log("Read + ORM p95 (not HTTP API latency):", report.readBenchmarks);
  } finally {
    db.sequelize.query = query;
    db.sequelize.transaction = originalTransaction;
    await transaction.rollback();
  }
};
verify().catch((error)=>{console.error(error);process.exitCode=1;}).finally(()=>db.sequelize.close());

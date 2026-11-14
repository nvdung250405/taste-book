// Run: npx babel-node scripts/verify-collection-search.js
// All fixtures live in TEMP tables in one transaction, always rolled back.
import assert from "node:assert/strict";
import db from "../src/models/index";
import { getMyRecipes } from "../src/services/recipeReadService";
import favoriteService from "../src/services/favoriteService";

const verify = async () => {
  const transaction = await db.sequelize.transaction();
  const originals = [];
  let scenarios = 0;
  try {
    const run = (sql) => db.sequelize.query(sql, { transaction });
    await run("CREATE EXTENSION IF NOT EXISTS unaccent");
    await run(`
      CREATE TEMP TABLE "Recipes" (
        id INTEGER PRIMARY KEY, "authorId" INTEGER, title TEXT,
        "thumbnailUrl" TEXT, "cookTimeMinutes" INTEGER DEFAULT 15,
        difficulty TEXT DEFAULT 'Easy', "defaultServings" INTEGER DEFAULT 2,
        "isPublic" BOOLEAN DEFAULT true, "approvalStatus" TEXT DEFAULT 'Approved',
        "isDeleted" BOOLEAN DEFAULT false, "rejectionReason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(), "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      ) ON COMMIT DROP;
      CREATE TEMP TABLE "Users" (id INTEGER PRIMARY KEY, username TEXT) ON COMMIT DROP;
      CREATE TEMP TABLE "FavoriteRecipes" (
        "userId" INTEGER, "recipeId" INTEGER, "personalNotes" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(), "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY ("userId", "recipeId")
      ) ON COMMIT DROP;
      INSERT INTO "Users" VALUES (10, 'Đầu Bếp'), (20, 'Alice');
      INSERT INTO "Recipes" (id, "authorId", title) VALUES
        (1, 10, 'Phở bò'), (2, 10, 'Phở gà'), (3, 10, 'Phở chay'),
        (4, 10, 'Phở nấm'), (5, 10, 'Phở nhà'), (6, 10, 'Phở nháp'),
        (7, 10, 'Bún 100%_ngon'), (8, 20, 'Phở khác'), (9, 10, 'Phở đã xóa'), (10, 20, 'Canh');
      UPDATE "Recipes" SET "approvalStatus" = 'Pending' WHERE id IN (3, 6);
      UPDATE "Recipes" SET "approvalStatus" = 'Rejected' WHERE id = 4;
      UPDATE "Recipes" SET "isPublic" = false WHERE id IN (5, 6);
      UPDATE "Recipes" SET "isDeleted" = true WHERE id = 9;
      INSERT INTO "FavoriteRecipes" ("userId", "recipeId", "personalNotes") VALUES
        (10, 1, NULL), (10, 8, 'Cuối tuần'), (10, 9, 'Đã xóa'),
        (10, 10, 'Ít muối'), (10, 7, '100%_ngon'), (20, 2, 'Ít muối');
    `);
    for (const [model, method] of [
      [db.Recipe, "findAll"], [db.Recipe, "findAndCountAll"], [db.FavoriteRecipe, "findAndCountAll"],
      [db.FavoriteRecipe, "count"], [db.FavoriteRecipe, "findAll"],
    ]) {
      const original = model[method];
      originals.push(() => { model[method] = original; });
      model[method] = (options) => original.call(model, { ...options, transaction });
    }
    const check = async (service, params, ids, total = ids.length) => {
      const result = await service(params);
      assert.equal(result.EC, 0, result.EM);
      assert.deepEqual(result.DT.items.map((item) => item.recipeId), ids);
      assert.equal(result.DT.total, total);
      assert.equal(result.DT.totalPages, Math.ceil(total / (params.limit || 10)));
      scenarios++;
      return result.DT;
    };
    const mine = (params) => getMyRecipes({ id: 10 }, params);
    const favorites = (params) => favoriteService.getUserFavorites(10, params);
    const expectedTotals = { total: 6, approved: 2, pending: 1, rejected: 1, private: 2 };
    for (const keyword of ["pho", "PHỞ", " phở "]) {
      const result = await check(mine, { search: keyword }, [6, 5, 4, 3, 2, 1]);
      assert.deepEqual(result.totals, expectedTotals);
    }
    const approved = await check(mine, { keyword: "pho", status: "approved", page: 2, limit: 1 }, [1], 2);
    assert.deepEqual(approved.totals, expectedTotals);
    await check(mine, { search: "pho", status: "pending" }, [3]);
    await check(mine, { search: "pho", status: "rejected" }, [4]);
    await check(mine, { search: "pho", status: "private" }, [6, 5]);
    await check(mine, { search: "pho", status: "DRAFT" }, [6, 5]);
    const empty = await check(mine, { search: "missing" }, []);
    assert.deepEqual(empty.totals, { total: 0, approved: 0, pending: 0, rejected: 0, private: 0 });
    await check(mine, { search: "pho", page: 20, limit: 1 }, [], 6);
    await check(mine, {}, [7, 6, 5, 4, 3, 2, 1]);
    await check(favorites, {}, [10, 8, 7, 1]);
    await check(favorites, { search: "PHO" }, [8, 1]);
    await check(favorites, { keyword: "phở", page: 2, limit: 1 }, [1], 2);
    await check(favorites, { search: "dau bep" }, [7, 1]);
    await check(favorites, { search: "ALICE" }, [10, 8]);
    await check(favorites, { search: "it muoi" }, [10]);
    await check(favorites, { search: "missing" }, []);
    for (const service of [mine, favorites]) {
      await check(service, { search: "%_" }, [7]);
      await check(service, { search: "x' OR 1=1 --" }, []);
      await check(service, { search: "\\" }, []);
    }
    console.log(JSON.stringify({ scenarios, result: "PASS: real PostgreSQL filtering, counts, joins, ownership, accents, pagination and literal metacharacters" }));
  } finally {
    for (const restore of originals) restore();
    await transaction.rollback();
  }
};

verify().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => db.sequelize.close());

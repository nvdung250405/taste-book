const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");

const seedDirectory = path.resolve(__dirname, "../../src/seeders");
const seeders = fs.readdirSync(seedDirectory).filter((name) => /^0[1-7]-.*\.js$/.test(name)).sort();
const document = fs.readFileSync(path.resolve(__dirname, "../../../docs/seed-data-vietnamese-cuisine-proposal.md"), "utf8");
const references = {
  Categories: { createdBy: "Users" },
  Ingredients: { ingredientCategoryId: "IngredientCategories", defaultUnitId: "Units" },
  Recipes: { authorId: "Users" },
  RecipeCategories: { recipeId: "Recipes", categoryId: "Categories" },
  RecipeIngredients: { recipeId: "Recipes", ingredientId: "Ingredients", unitId: "Units" },
  CookingSteps: { recipeId: "Recipes" },
  FavoriteRecipes: { userId: "Users", recipeId: "Recipes" },
  RecipeLists: { userId: "Users" },
  RecipeListItems: { recipeListId: "RecipeLists", recipeId: "Recipes" },
  ShoppingLists: { userId: "Users" },
  ShoppingListRecipeLists: { shoppingListId: "ShoppingLists", recipeListId: "RecipeLists" },
  ShoppingListItems: { shoppingListId: "ShoppingLists", ingredientId: "Ingredients" },
};

let tables;
let queries;
let models;
let sequelize;

beforeAll(async () => {
  tables = {};
  queries = [];
  // Collect the actual bulkInsert payloads; never connect to or reset a database.
  const queryInterface = {
    bulkDelete: async () => {},
    bulkInsert: async (table, records) => {
      for (const [column, parent] of Object.entries(references[table] || {})) {
        for (const record of records) {
          if (record[column] != null) {
            expect(tables[parent]?.some((row) => row.id === record[column])).toBe(true);
          }
        }
      }
      tables[table] = [...(tables[table] || []), ...records];
    },
    sequelize: { query: async (sql) => { queries.push(sql); } },
  };
  for (const name of seeders) await require(path.join(seedDirectory, name)).up(queryInterface);

  sequelize = new Sequelize({ dialect: "postgres", logging: false });
  models = {};
  const modelDirectory = path.resolve(__dirname, "../../src/models");
  for (const name of fs.readdirSync(modelDirectory).filter((file) => file.endsWith(".js") && file !== "index.js")) {
    const model = require(path.join(modelDirectory, name))(sequelize, DataTypes);
    models[model.tableName] = model;
  }
});

afterAll(async () => {
  if (sequelize) await sequelize.close();
});

test("seed payloads fit the current models, use unique keys and reset every explicit ID sequence", async () => {
  expect(seeders).toHaveLength(7);
  const counts = {
    Users: 4, Categories: 22, IngredientCategories: 13, Units: 29, Ingredients: 103,
    Recipes: 26, RecipeCategories: 80, RecipeIngredients: 337, CookingSteps: 134,
    FavoriteRecipes: 6, RecipeLists: 6, RecipeListItems: 12,
    ShoppingLists: 2, ShoppingListRecipeLists: 3, ShoppingListItems: 36,
  };
  expect(Object.keys(tables).sort()).toEqual(Object.keys(counts).sort());
  for (const [table, records] of Object.entries(tables)) {
    expect(records).toHaveLength(counts[table]);
    const model = models[table];
    const attributes = model.getAttributes();
    const keys = records.map((row) => model.primaryKeyAttributes.map((key) => row[key]).join(":"));
    expect(new Set(keys).size).toBe(records.length);
    for (const record of records) {
      expect(Object.keys(record).every((key) => attributes[key])).toBe(true);
      await expect(model.build(record).validate()).resolves.toBeDefined();
      if (model.options.timestamps) {
        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.updatedAt).toEqual(record.createdAt);
      }
    }
    if (records[0].id != null) {
      expect(queries.some((sql) => sql.includes(`"${table}"`) && sql.includes("setval") && sql.includes("max(id)"))).toBe(true);
    }
  }
  for (const [table, column] of [["Ingredients", "ingredientName"], ["Units", "unitName"], ["Users", "email"], ["Users", "phone"]]) {
    expect(new Set(tables[table].map((row) => row[column].toLowerCase())).size).toBe(tables[table].length);
  }
});

test("standard recipes use the admin and each existing User owns two private recipes", () => {
  expect(tables.Users.map(({ id, role }) => ({ id, role }))).toEqual([
    { id: 1, role: "Admin" }, { id: 2, role: "User" }, { id: 3, role: "User" }, { id: 4, role: "User" },
  ]);
  expect(tables.Recipes.filter((row) => row.isPublic)).toHaveLength(20);
  expect(tables.Recipes.every((row) => row.approvalStatus === "Approved" && !row.isDeleted)).toBe(true);
  expect(tables.Recipes.filter((row) => row.isPublic).every((row) => row.authorId === 1)).toBe(true);
  for (const userId of [2, 3, 4]) {
    expect(tables.Recipes.filter((row) => !row.isPublic && row.authorId === userId)).toHaveLength(2);
  }
});

test("preserves the first five images and allows optional image URLs for other recipes", () => {
  const expectedImages = [
    "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269532/tastebook_uploads/una957qnxfqpmeh7vm0t.jpg",
    "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269594/tastebook_uploads/hbspigqd9hauf2e0fhn0.webp",
    "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269633/tastebook_uploads/p0jhwrqov0o1dbrj1mky.webp",
    "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269671/tastebook_uploads/wultafhebuw7skdb9px7.webp",
    "https://res.cloudinary.com/sf4yjct9/image/upload/v1789269706/tastebook_uploads/fxtcqitccfiph1pi2o0i.jpg",
  ];
  expect(expectedImages.map((_, index) => tables.Recipes.find((row) => row.id === index + 1).thumbnailUrl)).toEqual(expectedImages);
  for (const recipe of tables.Recipes) {
    if (recipe.thumbnailUrl === null) continue;
    expect(typeof recipe.thumbnailUrl).toBe("string");
    const url = new URL(recipe.thumbnailUrl);
    expect(["http:", "https:"]).toContain(url.protocol);
    expect(url.hostname).not.toBe("");
  }
});

test("all recipes use system ingredients with their default units and preserve the documented steps", () => {
  const ingredients = new Map(tables.Ingredients.map((row) => [row.id, row]));
  for (const row of tables.RecipeIngredients) {
    expect(row.unitId).toBe(ingredients.get(row.ingredientId).defaultUnitId);
    expect(row.customIngredientName).toBeNull();
    expect(row.customUnit).toBeNull();
    expect(row.quantity).toBeGreaterThan(0);
  }
  const bodies = new Map(document.split(/### R/).slice(1).map((body) => [Number(body.slice(0, 2)), body.split(/\n## /)[0]]));
  for (const recipe of tables.Recipes) {
    const body = bodies.get(recipe.id);
    const instructions = [...body.matchAll(/^\d+\. (.+)$/gm)].map((match) => match[1].trim());
    const steps = tables.CookingSteps.filter((row) => row.recipeId === recipe.id);
    expect(steps.map((row) => row.instruction)).toEqual(instructions);
    expect(steps.map((row) => row.stepNumber)).toEqual(steps.map((_, index) => index + 1));
    expect(recipe.description).toContain(body.match(/\*\*Khi đổi khẩu phần:\*\* (.+)/)[1].trim());
    expect(recipe.description).toContain("các tỉ lệ trong bước áp dụng trên tổng lượng đã đổi");
    const ingredientIds = tables.RecipeIngredients.filter((row) => row.recipeId === recipe.id).map((row) => row.ingredientId);
    expect(ingredientIds.length).toBeGreaterThan(0);
    expect(new Set(ingredientIds).size).toBe(ingredientIds.length);
    expect(tables.RecipeCategories.some((row) => row.recipeId === recipe.id)).toBe(true);
  }
});

test("private categories, recipes, favorites and shopping list links respect ownership", () => {
  const byId = (table, id) => tables[table].find((row) => row.id === id);
  const accessible = (recipe, userId) => !recipe.isDeleted && (recipe.authorId === userId || (recipe.isPublic && recipe.approvalStatus === "Approved"));
  for (const link of tables.RecipeCategories) {
    const category = byId("Categories", link.categoryId);
    expect(category.createdBy == null || category.createdBy === byId("Recipes", link.recipeId).authorId).toBe(true);
  }
  for (const item of tables.RecipeListItems) {
    expect(accessible(byId("Recipes", item.recipeId), byId("RecipeLists", item.recipeListId).userId)).toBe(true);
    expect(Number.isInteger(item.targetServings) && item.targetServings > 0).toBe(true);
  }
  for (const favorite of tables.FavoriteRecipes) expect(accessible(byId("Recipes", favorite.recipeId), favorite.userId)).toBe(true);
  for (const link of tables.ShoppingListRecipeLists) {
    expect(byId("ShoppingLists", link.shoppingListId).userId).toBe(byId("RecipeLists", link.recipeListId).userId);
  }
});

test("shopping quantities aggregate every linked menu with the selected servings", () => {
  for (const shopping of tables.ShoppingLists) {
    const menus = tables.ShoppingListRecipeLists.filter((row) => row.shoppingListId === shopping.id).map((row) => row.recipeListId);
    const expected = new Map();
    for (const entry of tables.RecipeListItems.filter((row) => menus.includes(row.recipeListId))) {
      const recipe = tables.Recipes.find((row) => row.id === entry.recipeId);
      for (const ingredient of tables.RecipeIngredients.filter((row) => row.recipeId === recipe.id)) {
        const unit = tables.Units.find((row) => row.id === ingredient.unitId).unitName;
        const key = `${ingredient.ingredientId}:${unit}`;
        expected.set(key, (expected.get(key) || 0) + ingredient.quantity * entry.targetServings / recipe.defaultServings);
      }
    }
    const actual = tables.ShoppingListItems.filter((row) => row.shoppingListId === shopping.id);
    expect(actual.filter((row) => row.ingredientId != null)).toHaveLength(expected.size);
    for (const item of actual.filter((row) => row.ingredientId != null)) {
      const key = `${item.ingredientId}:${item.unit}`;
      expect(item.totalQuantity).toBe(Math.round(expected.get(key) * 100) / 100);
      expect(item.itemName).toBe(tables.Ingredients.find((row) => row.id === item.ingredientId).ingredientName);
      expected.delete(key);
    }
    expect(expected.size).toBe(0);
    if (shopping.status === "Completed") expect(actual.every((row) => row.isPurchased)).toBe(true);
  }
});

test("undoing the seeders deletes children before their referenced parents", async () => {
  const remaining = new Set(Object.keys(tables));
  const queryInterface = {
    bulkDelete: async (table) => {
      for (const child of remaining) {
        for (const [column, parent] of Object.entries(references[child] || {})) {
          if (parent === table) expect(tables[child].every((row) => row[column] == null)).toBe(true);
        }
      }
      remaining.delete(table);
    },
  };
  for (const name of [...seeders].reverse()) await require(path.join(seedDirectory, name)).down(queryInterface);
  expect(remaining.size).toBe(0);
});

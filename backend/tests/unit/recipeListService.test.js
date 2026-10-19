import service from "../../src/services/recipeListService";
import db from "../../src/models/index";

jest.mock("../../src/models/index", () => ({
  RecipeList: { findAll: jest.fn(), findOne: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  RecipeListItem: { findOne: jest.fn(), create: jest.fn() },
  Recipe: { findOne: jest.fn() },
  User: {},
}));

const calls = [
  ["getRecipeLists", []],
  ["createRecipeList", [{ listName: "Menu" }]],
  ["updateRecipeList", ["1", { listName: "Menu" }]],
  ["deleteRecipeList", ["1"]],
  ["getRecipeListDetail", ["1"]],
  ["addRecipeToRecipeList", ["1", { recipeId: 2, targetServings: 4 }]],
  ["updateRecipeListItemServings", ["1", "10", { targetServings: 4 }]],
  ["deleteRecipeListItem", ["1", "10"]],
];
const scoped = calls.filter(([name]) => !["getRecipeLists", "createRecipeList"].includes(name));
let list, item;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  list = { id: 1, userId: 1, listName: "Menu", recipeListItems: [], save: jest.fn(), destroy: jest.fn() };
  item = { id: 10, recipeId: 2, targetServings: 4, update: jest.fn(), destroy: jest.fn() };
  db.RecipeList.findAll.mockResolvedValue([list]);
  db.RecipeList.findByPk.mockResolvedValue(list);
  db.RecipeList.findOne.mockImplementation(async (options) => options.where.id === 1 ? list : null);
  db.RecipeList.create.mockImplementation(async (data) => ({ id: 1, ...data }));
  db.Recipe.findOne.mockResolvedValue({ authorId: 1 });
  db.RecipeListItem.findOne.mockImplementation(async (options) => options.where.id ? item : null);
  db.RecipeListItem.create.mockImplementation(async (data) => ({ id: 10, ...data }));
});

describe("RecipeListService (mock DB only)", () => {
  test.each(calls)("%s rejects missing authentication", async (name, args) => {
    expect(await service[name](null, ...args)).toMatchObject({ EC: 5, DT: null });
    expect(db.RecipeList.findByPk).not.toHaveBeenCalled();
  });
  test.each(calls)("%s returns success", async (name, args) => {
    expect((await service[name](1, ...args)).EC).toBe(0);
  });
  test.each(calls)("%s maps DB failures to EC -1", async (name, args) => {
    for (const model of [db.RecipeList, db.RecipeListItem, db.Recipe]) {
      for (const fn of Object.values(model)) fn.mockRejectedValue(new Error("DB unavailable"));
    }
    expect(await service[name](1, ...args)).toMatchObject({ EC: -1, DT: null });
  });
  test.each(scoped)("%s rejects another owner's list", async (name, args) => {
    list.userId = 9;
    expect((await service[name](1, ...args)).EC).toBe(4);
    expect(list.save).not.toHaveBeenCalled();
    expect(list.destroy).not.toHaveBeenCalled();
    expect(db.RecipeListItem.create).not.toHaveBeenCalled();
    expect(item.update).not.toHaveBeenCalled();
    expect(item.destroy).not.toHaveBeenCalled();
  });
  test.each(scoped)("%s returns not found for missing list", async (name, args) => {
    db.RecipeList.findByPk.mockResolvedValue(null);
    db.RecipeList.findOne.mockResolvedValue(null);
    expect((await service[name](1, ...args)).EC).toBe(3);
  });
  describe.each(scoped)("%s path validation", (name, args) => {
    test.each(["0", "-1", "1.5", "1e2", "0x1", " 1 ", "01", "2147483648", "9007199254740993", true, [], {}, null])("rejects %p before DB", async (id) => {
      expect((await service[name](1, id, ...args.slice(1))).EC).toBe(1);
      expect(db.RecipeList.findByPk).not.toHaveBeenCalled();
      expect(db.RecipeList.findOne).not.toHaveBeenCalled();
    });
  });
  describe.each(["createRecipeList", "updateRecipeList"])("%s names", (name) => {
    const invoke = (body) => name === "createRecipeList" ? service[name](1, body) : service[name](1, "1", body);
    test.each([123, true, {}, [], null, undefined, "", "   ", "a".repeat(101)])("rejects %p", async (listName) => {
      expect((await invoke({ listName })).EC).toBe(1);
      expect(db.RecipeList.create).not.toHaveBeenCalled();
      expect(list.save).not.toHaveBeenCalled();
    });
    test("trims and accepts 100 characters", async () => {
      const result = await invoke({ listName: `  ${"a".repeat(100)}  ` });
      expect(result.EC).toBe(0);
      if (name === "createRecipeList") expect(result.DT.listName).toBe("a".repeat(100));
      else expect(list.listName).toBe("a".repeat(100));
    });
    test("detects existing case-insensitive name", async () => {
      db.RecipeList.findOne.mockResolvedValue(list);
      expect((await invoke({ listName: "MENU" })).EC).toBe(2);
    });
  });
  describe.each(["addRecipeToRecipeList", "updateRecipeListItemServings"])("%s servings", (name) => {
    const invoke = (targetServings) => name === "addRecipeToRecipeList"
      ? service[name](1, "1", { recipeId: 2, targetServings })
      : service[name](1, "1", "10", { targetServings });
    test.each([true, "4", [4], {}, null, undefined, 0, -1, 1.5, Infinity, NaN, 2147483648])("rejects %p", async (value) => {
      expect(await invoke(value)).toEqual({
        EC: 1,
        EM: "Số khẩu phần ăn targetServings phải lớn hơn 0!",
        DT: null,
      });
      expect(db.RecipeList.findByPk).not.toHaveBeenCalled();
    });
    test.each([1, 2147483647])("accepts boundary %p", async (value) => {
      expect((await invoke(value)).EC).toBe(0);
    });
  });
  test.each([true, "2", [2], {}, null, 0, -1, 2.5, 2147483648])("rejects body recipeId %p", async (recipeId) => {
    expect((await service.addRecipeToRecipeList(1, "1", { recipeId, targetServings: 4 })).EC).toBe(1);
    expect(db.RecipeList.findByPk).not.toHaveBeenCalled();
  });
  test.each(["updateRecipeListItemServings", "deleteRecipeListItem"])("%s scopes item to parent list", async (name) => {
    db.RecipeListItem.findOne.mockResolvedValue(null);
    expect((await service[name](1, "1", "10", { targetServings: 4 })).EC).toBe(3);
    expect(db.RecipeListItem.findOne).toHaveBeenCalledWith({ where: { id: 10, recipeListId: 1 } });
  });
  test.each(["updateRecipeListItemServings", "deleteRecipeListItem"])("%s rejects invalid item ID", async (name) => {
    for (const id of ["1e2", "2147483648", "0", "abc", true]) {
      expect((await service[name](1, "1", id, { targetServings: 4 })).EC).toBe(1);
    }
    expect(db.RecipeListItem.findOne).not.toHaveBeenCalled();
  });
  test.each([null, { authorId: 9, isPublic: false, approvalStatus: "Approved" }, { authorId: 9, isPublic: true, approvalStatus: "Pending" }])("does not add inaccessible recipe %p", async (recipe) => {
    db.Recipe.findOne.mockResolvedValue(recipe);
    expect((await service.addRecipeToRecipeList(1, "1", { recipeId: 2, targetServings: 4 })).EC).toBe(3);
    expect(db.Recipe.findOne).toHaveBeenCalledWith({ where: { id: 2, isDeleted: false } });
    expect(db.RecipeListItem.create).not.toHaveBeenCalled();
  });
  test("adds approved public recipe of another user", async () => {
    db.Recipe.findOne.mockResolvedValue({ authorId: 9, isPublic: true, approvalStatus: "Approved" });
    expect((await service.addRecipeToRecipeList(1, "1", { recipeId: 2, targetServings: 4 })).EC).toBe(0);
  });
  test("rejects duplicate item before write", async () => {
    db.RecipeListItem.findOne.mockResolvedValue(item);
    expect((await service.addRecipeToRecipeList(1, "1", { recipeId: 2, targetServings: 4 })).EC).toBe(2);
    expect(db.RecipeListItem.create).not.toHaveBeenCalled();
  });
  test("list response filters user and counts items", async () => {
    list.createdAt = "2026-10-13T00:00:00.000Z";
    list.recipeListItems = [{ id: 10 }, { id: 11 }];
    expect((await service.getRecipeLists(1)).DT).toEqual([{ recipeListId: 1, listName: "Menu", totalItems: 2, createdAt: list.createdAt }]);
    expect(db.RecipeList.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
  });
  test("detail response maps recipe and author", async () => {
    list.recipeListItems = [{ ...item, recipe: { title: "Soup", thumbnailUrl: "image", cookTimeMinutes: 20, difficulty: "Easy", defaultServings: 2, author: { username: "Chef" } } }];
    expect((await service.getRecipeListDetail(1, "1")).DT.items[0]).toEqual({ recipeListItemId: 10, recipeId: 2, title: "Soup", thumbnailUrl: "image", cookTimeMinutes: 20, difficulty: "Easy", defaultServings: 2, targetServings: 4, authorName: "Chef" });
  });
});

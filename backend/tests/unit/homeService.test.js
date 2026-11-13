import homeService from "../../src/services/homeService";
import db from "../../src/models";

test("trending preserves ranked order and numeric counts when hydration returns another order", async () => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[{ id: 9, favoriteCount: "12" }, { id: 3, favoriteCount: "7" }], {}]);
  jest.spyOn(db.Recipe, "findAll")
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([
      { id: 3, title: "Bò kho", categories: [{ id: 1, categoryName: "Món chính" }] },
      { id: 9, title: "Canh", author: { id: 2, username: "Lan" }, categories: [] },
    ]);
  const result = await homeService.getHomeData({ limit: 2 });
  expect(result.EC).toBe(0);
  expect(result.DT.trendingRecipes).toEqual([
    expect.objectContaining({ recipeId: 9, favoriteCount: 12, author: { userId: 2, username: "Lan" }, categories: [] }),
    expect.objectContaining({ recipeId: 3, favoriteCount: 7, categories: [{ categoryId: 1, categoryName: "Món chính" }] }),
  ]);
});

test("no favorites leaves trending empty while retaining latest recipes", async () => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  const find = jest.spyOn(db.Recipe, "findAll").mockResolvedValue([{ id: 1, title: "Canh", categories: [] }]);
  const result = await homeService.getHomeData();
  expect(result.EC).toBe(0);
  expect(result.DT.latestRecipes).toHaveLength(1);
  expect(result.DT.trendingRecipes).toEqual([]);
  expect(find).toHaveBeenCalledTimes(1);
});

test("ranking query failure retains the API error envelope", async () => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(db.sequelize, "query").mockRejectedValue(new Error("Database unavailable"));
  jest.spyOn(db.Recipe, "findAll").mockResolvedValue([]);
  expect(await homeService.getHomeData()).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
});

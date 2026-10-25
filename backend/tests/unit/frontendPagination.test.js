import db from '../../src/models/index';
import { Op } from 'sequelize';
import favoriteService from '../../src/services/favoriteService';
import recipeService from '../../src/services/recipeService';

afterEach(() => jest.restoreAllMocks());

test('favorite lookup scopes visible IDs to the current user regardless of their saved list size', async () => {
  const lookup = jest.spyOn(db.FavoriteRecipe, 'findAndCountAll').mockResolvedValue({ count: 1, rows: [{ recipeId: 111 }] });
  const result = await favoriteService.getUserFavorites(10, { recipeIds: '111,120', limit: 100 });
  expect(result.DT.items.map(item => item.recipeId)).toEqual([111]);
  expect(lookup.mock.calls[0][0].where).toEqual({ userId: 10, recipeId: { [Op.in]: [111, 120] } });
});

test.each(['', '1,bad', '0', '1e2', ['1'], Array.from({ length: 101 }, (_, i) => i + 1).join(',')])('rejects malformed or unbounded favorite ID lists %p', async recipeIds => {
  const lookup = jest.spyOn(db.FavoriteRecipe, 'findAndCountAll');
  expect((await favoriteService.getUserFavorites(10, { recipeIds })).EC).toBe(1);
  expect(lookup).not.toHaveBeenCalled();
});

test('favorites searches title, author and personal notes before applying pagination', async () => {
  const lookup = jest.spyOn(db.FavoriteRecipe, 'findAndCountAll').mockResolvedValue({ count: 25, rows: [] });
  const result = await favoriteService.getUserFavorites(10, { search: ' canh ', page: 3, limit: 12 });
  const options = lookup.mock.calls[0][0];
  expect(options.where[Op.or]).toEqual([
    { '$recipe.title$': { [Op.iLike]: '%canh%' } },
    { '$recipe.author.username$': { [Op.iLike]: '%canh%' } },
    { personalNotes: { [Op.iLike]: '%canh%' } },
  ]);
  expect(options).toMatchObject({ subQuery: false, offset: 24, limit: 12 });
  expect(result.DT.totalPages).toBe(3);
});

test('my recipes filters globally and returns unfiltered status counts without loading the collection', async () => {
  const lookup = jest.spyOn(db.Recipe, 'findAndCountAll').mockResolvedValue({ count: 25, rows: [] });
  jest.spyOn(db.Recipe, 'count').mockResolvedValue([
    { isPublic: true, approvalStatus: 'Approved', count: 100 },
    { isPublic: true, approvalStatus: 'Pending', count: 25 },
    { isPublic: false, approvalStatus: 'Approved', count: 7 },
  ]);
  const result = await recipeService.getMyRecipes({ id: 10 }, { status: 'pending', search: 'canh', includeCounts: 'true', page: 3, limit: 12 });
  expect(lookup.mock.calls[0][0]).toMatchObject({
    where: { authorId: 10, isDeleted: false, isPublic: true, approvalStatus: 'Pending', title: { [Op.iLike]: '%canh%' } },
    offset: 24, limit: 12,
  });
  expect(result.DT.counts).toEqual({ all: 132, approved: 100, pending: 25, rejected: 0, draft: 7 });
  expect(result.DT.totalPages).toBe(3);
});

test('draft filter includes private recipes regardless of approval status', async () => {
  const lookup = jest.spyOn(db.Recipe, 'findAndCountAll').mockResolvedValue({ count: 0, rows: [] });
  await recipeService.getMyRecipes({ id: 10 }, { status: 'draft' });
  expect(lookup.mock.calls[0][0].where).toEqual({ authorId: 10, isDeleted: false, isPublic: false });
});

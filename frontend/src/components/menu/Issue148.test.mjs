import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, api, hooks, list, mount, CustomMenus, text } from './menuTestHarness.mjs'

test('menu deletion ignores repeated confirmation clicks', async () => {
  const originals = { deleteRecipeList: api.deleteRecipeList, getRecipeListItems: api.getRecipeListItems }
  let calls = 0, finish
  api.getRecipeListItems = async () => ({ DT: { items: [], activeShoppingTripCount: 0 } })
  api.deleteRecipeList = () => { calls++; return new Promise(resolve => { finish = resolve }) }
  const app = await mount(CustomMenus, {}, [[['recipe-lists'], { DT: [list] }]])
  try {
    await act(async () => app.view.root.findAllByType('button').find(b => b.props['aria-label'] === 'Xóa Family').props.onClick())
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)) })
    await act(async () => {
      const confirm = app.view.root.findAllByType('button').find(b => text(b) === 'Xác nhận xóa')
      assert.equal(confirm.props.disabled, false)
      confirm.props.onClick(); confirm.props.onClick(); confirm.props.onClick()
    })
    assert.equal(calls, 1)
    await act(async () => finish({ EC: 0 }))
  } finally { Object.assign(api, originals); await app.close() }
})

for (const [hook, method, variables] of [
  ['useUpdateRecipeList', 'updateRecipeList', { listId: 7, data: {} }],
  ['useDeleteRecipeList', 'deleteRecipeList', 7],
  ['useUpdateRecipePortion', 'updateRecipePortion', { listId: 7, itemId: 2, data: {} }],
  ['useRemoveRecipeFromMenu', 'removeRecipeFromMenu', { listId: 7, itemId: 2 }],
]) for (const error of [{ EC: 3 }, { httpStatus: 404 }]) test(`${hook} refreshes missing records: ${JSON.stringify(error)}`, async () => {
  const original = api[method]
  api[method] = async () => { throw error }
  let mutation
  function Harness() { mutation = hooks[hook](); return null }
  const app = await mount(Harness, {}, [[['recipe-lists'], { DT: [list] }], [['recipe-list', 7], { DT: { items: [] } }]])
  try {
    await act(async () => { await assert.rejects(mutation.mutateAsync(variables)) })
    assert.equal(app.client.getQueryState(['recipe-lists']).isInvalidated, true)
    assert.equal(app.client.getQueryState(['recipe-list', 7]).isInvalidated, true)
  } finally { api[method] = original; await app.close() }
})

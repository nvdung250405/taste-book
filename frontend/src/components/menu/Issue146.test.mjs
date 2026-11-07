import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, api, event, list, mount, MenuNameDialog } from './menuTestHarness.mjs'

test('rename accepts DT:null and rapid submits send one request', async () => {
  const original = api.updateRecipeList
  let finish, calls = 0, saved
  api.updateRecipeList = () => { calls++; return new Promise(resolve => { finish = resolve }) }
  const app = await mount(MenuNameDialog, { list, lists: [list], onSaved: value => { saved = value }, onClose() {} })
  try {
    await act(async () => app.view.root.findByType('input').props.onChange({ target: { value: ' Renamed ' } }))
    await act(async () => {
      const submit = app.view.root.findByType('form').props.onSubmit
      void submit(event); void submit(event); void submit(event)
    })
    assert.equal(calls, 1)
    await act(async () => finish({ EC: 0, DT: null }))
    assert.equal(saved.recipeListId, 7)
    assert.equal(saved.listName, 'Renamed')
    assert.equal(app.view.root.findAllByProps({ role: 'alert' }).length, 0)
  } finally { api.updateRecipeList = original; await app.close() }
})

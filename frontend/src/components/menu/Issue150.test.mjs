import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, event, mount, shoppingApi, ShoppingListDetail, text } from './menuTestHarness.mjs'

test('quick add resets fields and rapid submits create a single item', async () => {
  const original = shoppingApi.addCustomItem
  let calls = 0, finish
  shoppingApi.addCustomItem = () => { calls++; return new Promise(resolve => { finish = resolve }) }
  const app = await mount(ShoppingListDetail, { list: { shoppingListId: 9 } }, [[['shopping-list', 9], { DT: { items: [] } }]])
  try {
    const fill = async () => {
      await act(async () => {
        const inputs = app.view.root.findAllByType('input')
        for (const [i, value] of ['Milk', '2', 'box'].entries()) inputs[i].props.onChange({ target: { value } })
      })
    }
    await fill()
    await act(async () => app.view.root.findAllByType('button').find(b => text(b) === 'Đặt lại').props.onClick())
    assert.deepEqual(app.view.root.findAllByType('input').map(n => n.props.value), ['', '', ''])
    await fill()
    await act(async () => {
      const submit = app.view.root.findByType('form').props.onSubmit
      void submit(event); void submit(event); void submit(event)
    })
    assert.equal(calls, 1)
    await act(async () => finish({ DT: { itemId: 1, itemName: 'Milk', totalQuantity: 2, unit: 'box' } }))
  } finally { shoppingApi.addCustomItem = original; await app.close() }
})

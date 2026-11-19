import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, event, mount, shoppingApi, ShoppingListDetail, text, toast } from './menuTestHarness.mjs'

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

test('quick add selects a master unit and merges its response without duplicating a custom row', async () => {
  const originals = { ...shoppingApi }
  let request
  const items = [
    { itemId: 2, ingredientId: 4, itemName: 'Milk', unit: 'lít', totalQuantity: 1, isPurchased: true },
    { itemId: 3, ingredientId: null, itemName: 'Milk', unit: 'lít', totalQuantity: 3, isPurchased: false },
  ]
  const merged = { ...items[0], totalQuantity: 1.5, isPurchased: false, merged: true }
  shoppingApi.addCustomItem = async (id, data) => { request = { id, data }; return { DT: merged } }
  shoppingApi.getShoppingListDetail = async () => ({ DT: { items: [merged, items[1]] } })
  const app = await mount(ShoppingListDetail, { list: { shoppingListId: 9 } }, [
    [['ingredients', {}], { DT: [{ ingredientId: 4, ingredientName: 'Milk', defaultUnit: { unitName: 'lít' } }] }],
    [['shopping-list', 9], { DT: { items } }],
  ])
  try {
    const fields = () => app.view.root.findAllByType('input').filter(input => input.props.type !== 'checkbox')
    await act(async () => fields()[0].props.onChange({ target: { value: 'Milk' } }))
    await act(async () => app.view.root.findAllByType('button').find(button => text(button).startsWith('Dùng nguyên liệu chuẩn:')).props.onClick())
    assert.equal(fields()[2].props.value, 'lít')
    assert.equal(fields()[2].props.readOnly, true)
    await act(async () => fields()[1].props.onChange({ target: { value: '0,5' } }))
    await act(async () => app.view.root.findByType('form').props.onSubmit(event))
    assert.deepEqual(request, { id: 9, data: { ingredientId: 4, totalQuantity: 0.5 } })
    const cached = app.client.getQueryData(['shopping-list', 9]).DT.items
    assert.equal(cached.length, 2)
    assert.equal(cached.find(item => item.itemId === 2).totalQuantity, 1.5)
    assert.equal(cached.find(item => item.itemId === 2).isPurchased, false)
    assert.equal(cached.find(item => item.itemId === 3).totalQuantity, 3)
  } finally { Object.assign(shoppingApi, originals); await app.close() }
})

test('an older API leaves the master selection intact and never reports a successful addition', async () => {
  const original = { ...shoppingApi }
  const originalError = toast.error, originalSuccess = toast.success
  let error, success = false
  toast.error = value => { error = value }
  toast.success = () => { success = true }
  shoppingApi.addCustomItem = async () => { throw { EC: 1, EM: 'Tên món phát sinh phải là chuỗi!' } }
  shoppingApi.getShoppingListDetail = async () => ({ DT: { items: [] } })
  const app = await mount(ShoppingListDetail, { list: { shoppingListId: 9 } }, [
    [['ingredients', {}], { DT: [{ ingredientId: 4, ingredientName: 'Milk', defaultUnit: { unitName: 'lít' } }] }],
    [['shopping-list', 9], { DT: { items: [] } }],
  ])
  try {
    await act(async () => app.view.root.findAllByType('input')[0].props.onChange({ target: { value: 'Milk' } }))
    await act(async () => app.view.root.findAllByType('button').find(button => text(button).startsWith('Dùng nguyên liệu chuẩn:')).props.onClick())
    await act(async () => app.view.root.findByType('form').props.onSubmit(event))
    assert.equal(success, false)
    assert.equal(error, 'Chức năng thêm nguyên liệu chuẩn chưa sẵn sàng. Vui lòng thử lại sau.')
    assert.equal(app.view.root.findAllByType('input')[0].props.value, 'Milk')
    assert.equal(app.client.getQueryData(['shopping-list', 9]).DT.items.length, 0)
  } finally {
    Object.assign(shoppingApi, original)
    toast.error = originalError; toast.success = originalSuccess
    await app.close()
  }
})

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, event, list, mount, ShoppingListPage, text } from './menuTestHarness.mjs'

for (const title of ['', '   ']) test(`shopping title validation: ${JSON.stringify(title)}`, async () => {
  const app = await mount(ShoppingListPage, {}, [[['shopping-lists'], { DT: [] }], [['recipe-lists'], { DT: [list] }]])
  try {
    await act(async () => app.view.root.findAllByType('button').find(b => text(b).includes('Tạo danh sách')).props.onClick())
    await act(async () => app.view.root.findAllByType('input')[0].props.onChange({ target: { value: title } }))
    await act(async () => app.view.root.findByType('form').props.onSubmit(event))
    assert.equal(text(app.view.root.findByProps({ role: 'alert' })), 'Tiêu đề danh sách đi chợ không được để trống!')
    assert.equal(app.view.root.findAllByType('input')[0].props['aria-invalid'], true)
    await act(async () => app.view.root.findAllByType('input')[0].props.onChange({ target: { value: 'Valid' } }))
    assert.equal(app.view.root.findAllByProps({ role: 'alert' }).length, 0)
  } finally { await app.close() }
})

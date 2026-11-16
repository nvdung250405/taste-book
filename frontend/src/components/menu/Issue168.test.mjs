import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mount, ShoppingListDetail, text } from './menuTestHarness.mjs'

for (const [quantity, unit, expected] of [
  [0, 'cái', '0 cái'],
  [0, 'kg', '0 kg'],
  [1.5, 'kg', '1,5 kg'],
  [0, 'vừa đủ', 'vừa đủ'],
  [0, 'tùy khẩu vị', 'tùy khẩu vị'],
]) {
  test(`issue 168 shopping quantity: ${quantity} ${unit}`, async () => {
    const app = await mount(ShoppingListDetail, { list: { shoppingListId: 9 } }, [
      [['shopping-list', 9], { DT: { items: [{
        itemId: 1, itemName: 'Túi nilon', totalQuantity: quantity, unit, isPurchased: false,
      }] } }],
    ])
    try {
      const row = app.view.root.findAllByType('label').find(label => text(label).includes('Túi nilon'))
      assert.ok(row, 'Shopping item row is present')
      const quantityCell = row.findAllByType('span').find(span => span.props.className?.includes('text-right'))
      assert.equal(text(quantityCell).trim(), expected)
    } finally {
      await app.close()
    }
  })
}

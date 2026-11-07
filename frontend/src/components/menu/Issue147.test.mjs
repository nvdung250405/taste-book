import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, api, list, mount, CustomMenuDetail, text, toast } from './menuTestHarness.mjs'

test('menu detail renders recipe metadata and confirms portion updates', async () => {
  const original = api.updateRecipePortion
  const originalToast = toast.success
  let payload, message
  toast.success = value => { message = value }
  api.updateRecipePortion = async (...args) => { payload = args; return { EC: 0 } }
  const app = await mount(CustomMenuDetail, { list, onClose() {} }, [[['recipe-list', 7], { DT: { items: [{ recipeListItemId: 2, recipeId: 3, title: 'Soup', cookTimeMinutes: 25, difficulty: 'Medium', authorName: 'Cook', targetServings: 2 }] } }]])
  try {
    const html = text(app.view.toJSON())
    assert.match(html, /25 phút · Trung bình · Cook/)
    assert.equal(app.view.root.findByType('img').props.src, '/images/recipe-placeholder.svg')
    assert.equal(app.view.root.findByType('a').props.href, '/recipe/3')
    await act(async () => app.view.root.findByType('input').props.onBlur({ target: { value: '4' } }))
    assert.deepEqual(payload, [7, 2, { targetServings: 4 }])
    assert.equal(message, 'Cập nhật khẩu phần thành công!')
  } finally { api.updateRecipePortion = original; toast.success = originalToast; await app.close() }
})

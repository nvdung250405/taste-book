import assert from 'node:assert/strict'
import { test } from 'node:test'
import { act, api, list, mount, CustomMenus, CustomMenuDetail, text, toast, server } from './menuTestHarness.mjs'

test('view dishes opens a detail dialog and closing it returns to the menu cards', async () => {
  const { Dialog, DialogContent } = await server.ssrLoadModule('/src/components/ui/dialog.jsx')
  const app = await mount(CustomMenus, {}, [
    [['recipe-lists'], { DT: [list] }],
    [['recipe-list', 7], { DT: { items: [] } }],
  ])
  try {
    await act(async () => app.view.root.findAllByType('button').find(button => text(button) === 'Xem món').props.onClick())
    const detail = app.view.root.findByType(CustomMenuDetail)
    assert.equal(detail.findAllByType(Dialog)[0].props.open, true)
    assert.match(detail.findAllByType(DialogContent)[0].props.className, /max-h-.*overflow-y-auto.*sm:max-w-4xl/)
    await act(async () => app.view.root.findAllByType('button').find(button => text(button) === 'Đóng chi tiết').props.onClick())
    assert.equal(app.view.root.findAllByType(CustomMenuDetail).length, 0)
    assert.ok(app.view.root.findAllByType('button').some(button => text(button) === 'Xem món'))
  } finally { await app.close() }
})

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

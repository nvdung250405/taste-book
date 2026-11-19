import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  act,
  mount,
  server,
  text,
} from '../../components/menu/menuTestHarness.mjs'

test('moderation paginates 10 rows and resets the page on search or status changes', async () => {
  const Page = (
    await server.ssrLoadModule('/src/pages/admin/AdminApprovalsPage.jsx')
  ).default
  const recipes = Array.from({ length: 12 }, (_, index) => ({
    recipeId: index + 1,
    title: `Meal ${index + 1}`,
    authorName: 'Chef',
  }))
  const app = await mount(Page, {}, [
    [['pending-recipes'], { DT: recipes }],
    [
      ['pending-recipes', 'rejected'],
      { DT: [{ recipeId: 20, title: 'Rejected meal' }] },
    ],
  ])
  const button = (label) =>
    app.view.root.findAllByType('button').find((node) => text(node) === label)
  try {
    assert.equal(
      app.view.root.findAllByType('tbody')[0].findAllByType('tr').length,
      10,
    )
    await act(async () => button('Trang sau').props.onClick())
    assert.equal(
      app.view.root.findAllByType('tbody')[0].findAllByType('tr').length,
      2,
    )
    await act(async () =>
      app.view.root
        .findByType('input')
        .props.onChange({ target: { value: 'Meal 1' } }),
    )
    assert.equal(
      app.view.root.findAllByType('tbody')[0].findAllByType('tr').length,
      4,
    )
    await act(async () =>
        app.view.root
          .findAllByType('button')
          .find((node) => node.props['aria-label'] === 'Xóa tìm kiếm')
          .props.onClick(),
    )
    await act(async () => button('Trang sau').props.onClick())
    await act(async () => button('Đã từ chối').props.onClick())
    assert.match(text(app.view.toJSON()), /Rejected meal/)
    assert.equal(
      app.view.root.findAllByType('tbody')[0].findAllByType('tr').length,
      1,
    )
    assert.equal(button('Trang sau'), undefined)
  } finally {
    await app.close()
  }
})

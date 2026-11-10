import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createElement, useState } from 'react'
import { act, api, server, list, mount, CustomMenus, CustomMenuDetail, text, toast } from './menuTestHarness.mjs'

const flush = () => new Promise(resolve => setTimeout(resolve, 20))

test('a failed background menu refresh preserves cached menu cards', async () => {
  const original = api.getRecipeLists
  api.getRecipeLists = async () => { throw Object.assign(new Error('Offline'), { isNetworkError: true }) }
  const app = await mount(CustomMenus, {}, [[['recipe-lists'], { DT: [list] }]])
  try {
    await act(async () => { await app.client.invalidateQueries({ queryKey: ['recipe-lists'] }) })
    await act(flush)
    assert.equal(app.client.getQueryState(['recipe-lists']).status, 'error')
    assert.match(text(app.view.toJSON()), /Family/)
    assert.ok(app.view.root.findAllByType('button').some(b => b.props['aria-label'] === 'Xóa Family'))
  } finally { api.getRecipeLists = original; await app.close() }
})

test('portion editing blocks 101 before calling the API and accepts the upper bound 100', async () => {
  const original = api.updateRecipePortion
  const originalError = toast.error
  let calls = 0, message
  api.updateRecipePortion = async () => { calls++; return { EC: 0 } }
  toast.error = value => { message = value }
  const app = await mount(CustomMenuDetail, { list, onClose() {} }, [[['recipe-list', 7], { DT: { items: [{ recipeListItemId: 2, recipeId: 3, title: 'Soup', targetServings: 2 }] } }]])
  try {
    const input = app.view.root.findByType('input')
    assert.equal(input.props.max, '100')
    const target = { value: '101' }
    await act(async () => input.props.onBlur({ target }))
    assert.equal(calls, 0)
    assert.equal(target.value, 2)
    assert.equal(message, 'Khẩu phần phải là số nguyên từ 1 đến 100.')
    await act(async () => input.props.onBlur({ target: { value: '100' } }))
    assert.equal(calls, 1)
  } finally { api.updateRecipePortion = original; toast.error = originalError; await app.close() }
})

for (const stage of ['preflight', 'delete']) for (const error of [{ EC: 3 }, { httpStatus: 404 }]) {
  test(`missing menu closes dialog and refreshes lists at ${stage}: ${JSON.stringify(error)}`, async () => {
    const original = { ...api }
    const originalToast = toast.error
    let message, reads = 0
    toast.error = value => { message = value }
    api.getRecipeLists = async () => { reads++; return { DT: [] } }
    api.getRecipeListItems = async () => {
      if (stage === 'preflight') throw error
      return { DT: { items: [], activeShoppingTripCount: 0 } }
    }
    api.deleteRecipeList = async () => { throw error }
    const app = await mount(CustomMenus, {}, [[['recipe-lists'], { DT: [list] }]])
    try {
      await act(async () => app.view.root.findAllByType('button').find(b => b.props['aria-label'] === 'Xóa Family').props.onClick())
      await act(flush)
      if (stage === 'delete') {
        await act(async () => app.view.root.findAllByType('button').find(b => text(b) === 'Xác nhận xóa').props.onClick())
        await act(flush)
      }
      assert.equal(message, 'Không tìm thấy thực đơn hoặc thực đơn đã bị xóa trước đó!')
      assert.ok(reads > 0)
      assert.equal(app.view.root.findAllByType('button').some(b => text(b) === 'Xác nhận xóa'), false)
      assert.doesNotMatch(text(app.view.toJSON()), /Không thể kiểm tra liên kết chuyến đi chợ/)
    } finally { Object.assign(api, original); toast.error = originalToast; await app.close() }
  })
}

test('public checkbox updates visibility without an extra confirmation popup', async () => {
  const BasicInfo = (await server.ssrLoadModule('/src/components/recipe/RecipeBasicInfoForm.jsx')).default
  function Harness() {
    const [formData, setFormData] = useState({ title: 'Soup', description: '', categories: [], thumbnail: '', isPublic: false })
    return createElement(BasicInfo, { formData, setFormData, categories: [], handleChange() {}, toggleCategory() {} })
  }
  const app = await mount(Harness)
  try {
    await act(async () => app.view.root.findAllByType('input').find(n => n.props.type === 'checkbox').props.onChange({ target: { checked: true } }))
    assert.equal(app.view.root.findAllByType('input').find(n => n.props.type === 'checkbox').props.checked, true)
    assert.doesNotMatch(text(app.view.toJSON()), /Chuyển công thức sang công khai\?|Xác nhận công khai/)
    assert.match(text(app.view.toJSON()), /Sau khi gửi duyệt/)
  } finally { await app.close() }
})

test('master ingredient selection is explicit and detaching unlocks the unit without changing its name', async () => {
  const Form = (await server.ssrLoadModule('/src/components/recipe/RecipeIngredientsForm.jsx')).default
  const { changeRecipeIngredient } = await server.ssrLoadModule('/src/lib/recipeIngredientSelection.js')
  const ingredients = [{ ingredientId: 1, ingredientName: 'Milk', defaultUnit: { unitId: 2, unitName: 'ml' } }]
  function Harness() {
    const [row, setRow] = useState({ name: '', quantity: '2', unit: 'box' })
    return createElement(Form, {
      formData: { ingredients: [row] }, ingredients, units: [],
      handleIngChange: (_, field, value) => setRow(old => changeRecipeIngredient(old, field, value, ingredients, [])),
      removeIngredient() {}, addIngredient() {},
    })
  }
  const app = await mount(Harness)
  const input = label => app.view.root.findAllByType('input').find(n => n.props['aria-label'] === label)
  try {
    await act(async () => input('Tên nguyên liệu 1').props.onChange({ target: { value: 'Milk' } }))
    assert.equal(input('Đơn vị nguyên liệu 1').props.disabled, false)
    assert.equal(input('Đơn vị nguyên liệu 1').props.value, 'box')
    await act(async () => app.view.root.findAllByType('button').find(b => text(b).startsWith('Dùng nguyên liệu chuẩn:')).props.onClick())
    assert.equal(input('Đơn vị nguyên liệu 1').props.disabled, true)
    assert.equal(input('Đơn vị nguyên liệu 1').props.value, 'ml')
    await act(async () => app.view.root.findAllByType('button').find(b => text(b) === 'Dùng tự do').props.onClick())
    assert.equal(input('Tên nguyên liệu 1').props.value, 'Milk')
    assert.equal(input('Đơn vị nguyên liệu 1').props.disabled, false)
    await act(async () => input('Đơn vị nguyên liệu 1').props.onChange({ target: { value: 'box' } }))
    assert.equal(input('Đơn vị nguyên liệu 1').props.value, 'box')
  } finally { await app.close() }
})

test('server failure during deletion preflight keeps retry visible and does not report a missing menu', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', { configurable: true, value: Object.assign(new EventTarget(), { setInterval, clearInterval }) })
  const original = api.getRecipeListItems
  api.getRecipeListItems = async () => { throw { httpStatus: 500, EM: 'Server error' } }
  const app = await mount(CustomMenus, {}, [[['recipe-lists'], { DT: [list] }]])
  try {
    await act(async () => app.view.root.findAllByType('button').find(b => b.props['aria-label'] === 'Xóa Family').props.onClick())
    await act(flush)
    assert.match(text(app.view.toJSON()), /Không thể kiểm tra liên kết chuyến đi chợ/)
    assert.ok(app.view.root.findAllByType('button').some(b => text(b) === 'Xác nhận xóa'))
  } finally {
    api.getRecipeListItems = original
    await app.close()
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor)
    else delete globalThis.window
  }
})

test('offline menu notice retains cached view and refetches on reconnect, with listener cleanup', async () => {
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const originalToast = toast.success
  const browser = new EventTarget()
  const network = { onLine: false }
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser })
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: network })
  let reads = 0, message
  toast.success = value => { message = value }
  const Notice = (await server.ssrLoadModule('/src/components/menu/MenuConnectionNotice.jsx')).default
  const query = { data: { DT: [list] }, refetch: async () => { reads++; return { isError: false } } }
  let app
  try {
    app = await mount(Notice, { query })
    assert.match(text(app.view.toJSON()), /Mất kết nối Internet.*bộ nhớ đệm/)
    await act(async () => { network.onLine = true; browser.dispatchEvent(new Event('online')) })
    assert.equal(reads, 1)
    assert.equal(app.view.toJSON(), null)
    assert.equal(message, 'Đã khôi phục kết nối mạng. Dữ liệu đã được cập nhật.')
    await app.close(); app = null
    browser.dispatchEvent(new Event('online'))
    assert.equal(reads, 1)
  } finally {
    if (app) await app.close()
    toast.success = originalToast
    if (windowDescriptor) Object.defineProperty(globalThis, 'window', windowDescriptor)
    else delete globalThis.window
    if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor)
    else delete globalThis.navigator
  }
})

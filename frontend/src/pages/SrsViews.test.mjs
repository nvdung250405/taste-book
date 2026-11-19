import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let server, Shopping, Menu, Ingredients
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    plugins: [{
      name: 'render-dialog-content-without-browser', enforce: 'pre',
      load(id) {
        if (!id.replaceAll('\\', '/').endsWith('/components/ui/dialog.jsx')) return
        return `import { createElement } from 'react';
          export const Dialog = ({open, children}) => open ? createElement('div', null, children) : null;
          export const DialogContent = ({children}) => createElement('div', null, children);
          export const DialogHeader = DialogContent, DialogTitle = DialogContent, DialogDescription = DialogContent, DialogFooter = DialogContent;`
      },
    }],
  })
  Shopping = (await server.ssrLoadModule('/src/pages/ShoppingListPage.jsx'))
    .default
  Menu = (
    await server.ssrLoadModule('/src/components/menu/CustomMenuDetail.jsx')
  ).default
  Ingredients = (
    await server.ssrLoadModule('/src/components/recipe/RecipeIngredients.jsx')
  ).default
})
after(async () => {
  await server?.close()
})
function render(client, Component, props, entry = '/') {
  return renderToString(
    createElement(
      QueryClientProvider,
      { client },
      createElement(
        MemoryRouter,
        { initialEntries: [entry] },
        createElement(Component, props),
      ),
    ),
  )
}
test('shopping navigation state selects the newly created ID instead of the first list', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  client.setQueryData(['shopping-lists'], {
    DT: [
      { shoppingListId: 1, title: 'Old', status: 'In_Progress' },
      { shoppingListId: 99, title: 'New', status: 'In_Progress' },
    ],
  })
  try {
    const html = render(
      client,
      Shopping,
      {},
      { pathname: '/shopping-list', state: { selectedId: 99 } },
    )
    assert.match(html, /value="99" selected=""/)
    assert.match(html, /<h2[^>]*>New<\/h2>/)
    assert.ok(
      client
        .getQueryCache()
        .find({ queryKey: ['shopping-list', 99], exact: true }),
    )
  } finally {
    client.clear()
  }
})
test('deleted menu source retains its row and remove action but has no detail link or editable servings', () => {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity } },
  })
  client.setQueryData(['recipe-list', 10], {
    DT: {
      items: [
        {
          recipeListItemId: 22,
          recipeId: 2,
          title: 'Deleted',
          targetServings: 2,
          isRecipeDeleted: true,
        },
      ],
    },
  })
  try {
    const html = render(client, Menu, {
      list: { recipeListId: 10, listName: 'Menu' },
      onClose() {},
    })
    assert.match(html, /Công thức đã bị xóa/)
    assert.match(html, /aria-label="Khẩu phần Deleted" disabled=""/)
    assert.match(html, /aria-label="Bỏ Deleted khỏi thực đơn"/)
    assert.doesNotMatch(html, /href="\/recipe\/2"/)
  } finally {
    client.clear()
  }
})
test('qualitative ingredients show their unit with no numeric amount when scaled', () => {
  const client = new QueryClient()
  try {
    const html = render(client, Ingredients, {
      ingredients: [{ ingredientName: 'Muối', quantity: 0, unit: 'vừa đủ' }],
      actualServings: 4,
      setServings() {},
      ratio: 2,
    })
    assert.match(html, /vừa đủ/)
    assert.doesNotMatch(html, /0(?:<!--.*?-->|\s)*vừa đủ/)
  } finally {
    client.clear()
  }
})

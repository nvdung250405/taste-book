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

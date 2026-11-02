import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'

let server
let MyRecipeCard
before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  MyRecipeCard = (
    await server.ssrLoadModule('/src/components/recipe/MyRecipeCard.jsx')
  ).default
})
after(async () => {
  await server?.close()
})

test('private rejected recipe displays a red rejected badge and its feedback', () => {
  const html = renderToString(
    createElement(
      MemoryRouter,
      null,
      createElement(MyRecipeCard, {
        recipe: {
          recipeId: 12,
          title: 'Cá kho',
          isPublic: false,
          approvalStatus: 'Rejected',
          rejectionReason: 'Thiếu bước chế biến',
        },
        index: 0,
        gridColumns: 3,
        onDelete: () => {},
      }),
    ),
  )
  assert.match(html, /Bị từ chối/)
  assert.match(html, /bg-rose-50 text-rose-700/)
  assert.match(html, /Lý do từ chối:/)
  assert.match(html, /Thiếu bước chế biến/)
  assert.doesNotMatch(html, /Riêng tư/)
  assert.match(html, /\/recipe\/12\/edit/)
})

import { before, after } from 'node:test'
import { createElement } from 'react'
import { act, create } from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createServer } from 'vite'
export { toast } from 'sonner'

export let server, api, shoppingApi, hooks, MenuNameDialog, CustomMenus, CustomMenuDetail, ShoppingListDetail, ShoppingListPage
const storage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
before(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null } })
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    plugins: [{
      name: 'test-dialog-without-browser-portal', enforce: 'pre',
      load(id) {
        if (!id.replaceAll('\\', '/').endsWith('/components/ui/dialog.jsx')) return
        return `import { createElement } from 'react';
          export const Dialog = ({open, children}) => open ? createElement('div', null, children) : null;
          export const DialogContent = ({children}) => createElement('div', null, children);
          export const DialogHeader = DialogContent, DialogTitle = DialogContent, DialogDescription = DialogContent, DialogFooter = DialogContent;`
      },
    }],
  })
  const load = async path => (await server.ssrLoadModule('/src/' + path)).default
  api = await load('api/recipeLists.api.js')
  shoppingApi = await load('api/shoppingLists.api.js')
  hooks = await server.ssrLoadModule('/src/hooks/queries/useRecipeListQueries.js')
  MenuNameDialog = await load('components/menu/MenuNameDialog.jsx')
  CustomMenus = await load('components/menu/CustomMenus.jsx')
  CustomMenuDetail = await load('components/menu/CustomMenuDetail.jsx')
  ShoppingListDetail = await load('components/shopping-list/ShoppingListDetail.jsx')
  ShoppingListPage = await load('pages/ShoppingListPage.jsx')
})
after(async () => {
  await server?.close()
  delete globalThis.IS_REACT_ACT_ENVIRONMENT
  if (storage) Object.defineProperty(globalThis, 'localStorage', storage)
  else delete globalThis.localStorage
})
export const event = { preventDefault() {} }
export const text = node => typeof node === 'string' ? node : (node?.children || []).map(text).join('')
export async function mount(Component, props = {}, seed = []) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } } })
  for (const [key, value] of seed) client.setQueryData(key, value)
  let view
  await act(async () => {
    view = create(createElement(QueryClientProvider, { client }, createElement(MemoryRouter, null, createElement(Component, props))), {
      createNodeMock: () => ({ focus() {} }),
    })
  })
  return { view, client, async close() { await act(async () => view.unmount()); client.clear() } }
}
export const list = { recipeListId: 7, listName: 'Family', totalItems: 1 }


export { act }

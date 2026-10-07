// These endpoints only filter on the client, so collect every server page first.
export async function fetchCollection(fetchPage, signal) {
  signal?.throwIfAborted()
  const first = await fetchPage(1)
  const items = [...(first.DT?.items || [])]
  const totalPages = first.DT?.totalPages || 1

  for (let page = 2; page <= totalPages; page++) {
    signal?.throwIfAborted()
    const response = await fetchPage(page)
    items.push(...(response.DT?.items || []))
  }
  signal?.throwIfAborted()

  // A concurrent insertion can move a recipe onto the next server page.
  const uniqueItems = [...new Map(items.map(item => [item.recipeId, item])).values()]
  return {
    ...first,
    DT: { items: uniqueItems, total: uniqueItems.length },
  }
}

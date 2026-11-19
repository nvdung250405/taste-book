// Deterministic browser/layout coverage; these fixtures do not certify live APIs.
export const categories = [
  { categoryId: 1, categoryName: 'Món chính', createdBy: null },
]
export const recipe = {
  recipeId: 1,
  title: 'Công thức kiểm thử',
  description: 'Món ăn dùng kiểm tra bố cục trên nhiều thiết bị.',
  thumbnailUrl: '/images/optimized/hero-bg-640.webp',
  cookTimeMinutes: 20,
  defaultServings: 4,
  difficulty: 'Easy',
  authorName: 'TasteBook Chef',
  isPublic: true,
  approvalStatus: 'Approved',
  categories,
  ingredients: [
    { ingredientId: 4, ingredientName: 'Sữa', quantity: 1.5, unit: 'lít' },
  ],
  steps: [{ stepNumber: 1, instruction: 'Chuẩn bị nguyên liệu.' }],
}
const recipes = Array.from({ length: 12 }, (_, i) => ({
  ...recipe,
  recipeId: i + 1,
  title: `${recipe.title} ${i + 1}`,
}))

export async function setupFixtureApi(
  page,
  role = 'User',
  authenticated = false,
) {
  if (authenticated) {
    const payload = Buffer.from(
      JSON.stringify({
        id: 7,
        role,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString('base64url')
    await page.addInitScript(
      (token) => localStorage.setItem('token', token),
      `fixture.${payload}.fixture`,
    )
  }
  const user = {
    userId: 7,
    id: 7,
    username: 'Người kiểm thử',
    email: 'tester@example.test',
    phone: '0912345678',
    role,
  }
  await page.route('**/api/v1/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname.replace(
      '/api/v1',
      '',
    )
    let DT
    if (pathname === '/home')
      DT = {
        latestRecipes: recipes.slice(0, 6),
        trendingRecipes: recipes.slice(0, 6),
      }
    else if (pathname === '/users/me') DT = user
    else if (/categories$/.test(pathname)) DT = categories
    else if (/\/ingredients$/.test(pathname))
      DT = [
        {
          ingredientId: 4,
          ingredientName: 'Sữa',
          defaultUnit: { unitId: 1, unitName: 'lít' },
        },
      ]
    else if (/\/units$/.test(pathname)) DT = [{ unitId: 1, unitName: 'lít' }]
    else if (pathname === '/ingredient-categories') DT = []
    else if (pathname === '/admin/users')
      DT = {
        users: [user],
        items: [user],
        total: 1,
        totalPages: 1,
        totalUsers: 1,
      }
    else if (pathname === '/admin/recipes/pending') DT = recipes
    else if (pathname === '/admin/recipes') DT = { recipes, total: 12 }
    else if (pathname === '/recipes/mine' || pathname === '/favorites')
      DT = {
        items: recipes,
        total: 12,
        totalPages: 1,
        totals: { all: 12, approved: 12, pending: 0, rejected: 0, private: 0 },
      }
    else if (pathname === '/recipes')
      DT = { recipes, items: recipes, total: 12, totalPages: 1 }
    else if (/^\/recipes\/\d+$/.test(pathname)) DT = recipe
    else if (pathname === '/recipe-lists')
      DT = [{ recipeListId: 7, listName: 'Thực đơn kiểm thử', totalItems: 1 }]
    else if (/^\/recipe-lists\/\d+$/.test(pathname))
      DT = { items: [{ ...recipe, recipeListItemId: 1, targetServings: 4 }] }
    else if (pathname === '/shopping-lists')
      DT = [
        {
          shoppingListId: 1,
          title: 'Chuyến đi chợ kiểm thử',
          status: 'In_Progress',
        },
      ]
    else if (/^\/shopping-lists\/\d+$/.test(pathname))
      DT = {
        items: [
          {
            itemId: 1,
            ingredientId: 4,
            itemName: 'Sữa',
            totalQuantity: 1.5,
            unit: 'lít',
            isPurchased: false,
          },
        ],
      }
    else throw new Error(`Missing browser fixture: ${pathname}`)
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ EC: 0, DT }),
    })
  })
}

export default function DeletedRecipesWarning({ recipes }) {
  return (
    <div
      role="alert"
      className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <p>
        Các món sau đây đã bị tác giả xóa và sẽ không được tổng hợp nguyên liệu:
      </p>
      <ul className="list-inside list-disc">
        {recipes.map((recipe, index) => (
          <li key={recipe.recipeListItemId || index}>{recipe.title}</li>
        ))}
      </ul>
      <p>
        Bạn có muốn tiếp tục tạo danh sách đi chợ với các món còn lại không?
      </p>
    </div>
  )
}

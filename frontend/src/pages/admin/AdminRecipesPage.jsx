import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookOpen, Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAdminRecipes,
  useDeleteAdminRecipe,
} from '../../hooks/queries/useRecipeQueries'
import useCollectionParams from '../../hooks/useCollectionParams'
import {
  recipeImageProps,
  handleRecipeImageError,
} from '../../lib/recipeImages'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'
import QueryError from '../../components/ui/QueryError'
import ListPagination from '../../components/ui/ListPagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog'

const difficultyNames = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' }
export default function AdminRecipesPage() {
  const { page, search, searchQuery, setSearchQuery, setPage } =
    useCollectionParams()
  const [params, setParams] = useSearchParams()
  const difficulty = params.get('difficulty') || ''
  const maxTime = params.get('maxTime') || ''
  const query = useAdminRecipes(search.trim() ? { keyword: search.trim() } : {})
  const remove = useDeleteAdminRecipe()
  const sending = useRef(false)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const recipes = (query.data?.DT?.recipes || []).filter(
    (recipe) =>
      (!difficulty || recipe.difficulty === difficulty) &&
      (!maxTime || Number(recipe.cookTimeMinutes) <= Number(maxTime)),
  )
  const totalPages = Math.max(1, Math.ceil(recipes.length / 10))
  useEffect(() => {
    if (query.isSuccess && !query.isFetching && page > totalPages)
      setPage(totalPages)
  }, [query.isSuccess, query.isFetching, page, totalPages, setPage])
  const changeFilters = (changes) => {
    const next = new URLSearchParams(params)
    if (searchQuery) next.set('search', searchQuery)
    else next.delete('search')
    next.delete('page')
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setParams(next)
  }
  const confirmDelete = async () => {
    if (sending.current) return
    sending.current = true
    setError('')
    try {
      await remove.mutateAsync(selected.recipeId)
      toast.success('Đã xóa mềm công thức chuẩn')
      setSelected(null)
    } catch (failure) {
      setError(failure?.EM || 'Không thể xóa công thức. Vui lòng thử lại.')
    } finally {
      sending.current = false
    }
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <BookOpen className="h-4 w-4" />
            Dữ liệu hệ thống
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Quản lý công thức chuẩn
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Các công thức công khai đã duyệt do Admin tạo.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
            aria-label="Làm mới công thức"
          >
            <RefreshCw
              className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
            />
          </Button>
          <Button
            asChild
            className="rounded-xl bg-orange-600 text-white hover:bg-orange-700"
          >
            <Link to="/admin/recipes/create">
              <Plus className="h-4 w-4" />
              Thêm công thức chuẩn
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Tìm công thức chuẩn"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên món…"
            className="h-11 rounded-xl bg-white pl-9 dark:bg-slate-950"
          />
        </div>
        <select
          aria-label="Lọc độ khó"
          value={difficulty}
          onChange={(event) =>
            changeFilters({ difficulty: event.target.value })
          }
          className="h-11 rounded-xl border bg-white px-3 text-sm dark:bg-slate-950"
        >
          <option value="">Tất cả độ khó</option>
          {Object.entries(difficultyNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc thời gian nấu"
          value={maxTime}
          onChange={(event) => changeFilters({ maxTime: event.target.value })}
          className="h-11 rounded-xl border bg-white px-3 text-sm dark:bg-slate-950"
        >
          <option value="">Tất cả thời gian</option>
          <option value="15">Tối đa 15 phút</option>
          <option value="30">Tối đa 30 phút</option>
          <option value="60">Tối đa 60 phút</option>
        </select>
        {(searchQuery || difficulty || maxTime) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setParams({})
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
      {query.isError ? (
        <QueryError
          title="Không thể tải công thức chuẩn"
          onRetry={query.refetch}
          isRetrying={query.isFetching}
        />
      ) : (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">
                Danh sách công thức chuẩn hệ thống
              </caption>
              <thead className="border-b bg-slate-50 text-slate-500 dark:bg-slate-900">
                <tr>
                  {[
                    'Công thức',
                    'Tác giả',
                    'Thời gian',
                    'Khẩu phần',
                    'Độ khó',
                    'Thao tác',
                  ].map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="px-4 py-3 font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {query.isPending ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center" role="status">
                      Đang tải công thức…
                    </td>
                  </tr>
                ) : !recipes.length ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      {search || difficulty || maxTime
                        ? 'Không tìm thấy công thức phù hợp.'
                        : 'Chưa có công thức chuẩn. Hãy thêm công thức đầu tiên.'}
                    </td>
                  </tr>
                ) : (
                  recipes.slice((page - 1) * 10, page * 10).map((recipe) => (
                    <tr
                      key={recipe.recipeId}
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/recipe/${recipe.recipeId}`}
                          className="flex items-center gap-3 hover:text-orange-600"
                        >
                          <img
                            {...recipeImageProps(recipe.thumbnailUrl)}
                            onError={handleRecipeImageError}
                            alt=""
                            loading="lazy"
                            className="h-12 w-12 shrink-0 rounded-lg object-cover"
                          />
                          <div className="max-w-64 break-words font-medium">
                            {recipe.title}
                            <span className="mt-1 block text-xs font-normal text-slate-500">
                              #{recipe.recipeId} · Đã duyệt
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="max-w-40 break-words px-4 py-3">
                        {recipe.authorName || 'Admin'}
                      </td>
                      <td className="px-4 py-3">
                        {recipe.cookTimeMinutes} phút
                      </td>
                      <td className="px-4 py-3">{recipe.defaultServings}</td>
                      <td className="px-4 py-3">
                        {difficultyNames[recipe.difficulty] ||
                          recipe.difficulty}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            aria-label={`Sửa ${recipe.title}`}
                            to={`/admin/recipes/${recipe.recipeId}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          aria-label={`Xóa ${recipe.title}`}
                          disabled={remove.isPending}
                          onClick={() => {
                            setError('')
                            setSelected(recipe)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!query.isPending && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 [&_nav]:mt-0">
              <p className="text-sm text-slate-500" aria-live="polite">
                {recipes.length ? (page - 1) * 10 + 1 : 0}–
                {Math.min(page * 10, recipes.length)} / {recipes.length} công
                thức
              </p>
              <ListPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </Card>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setSelected(null)
        }}
      >
        <DialogContent
          showCloseButton={!remove.isPending}
          onEscapeKeyDown={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
          className="rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle>Xóa mềm công thức chuẩn?</DialogTitle>
            <DialogDescription>
              Công thức “{selected?.title}” sẽ được gỡ khỏi danh sách đang sử
              dụng và không còn hiển thị công khai. Dữ liệu được đánh dấu xóa
              tại hệ thống, không xóa vĩnh viễn.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setSelected(null)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={confirmDelete}
            >
              {remove.isPending ? 'Đang xóa…' : 'Xác nhận xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

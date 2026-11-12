import { useRef, useState } from 'react'
import {
  BookOpenCheck,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import QueryError from '../../components/ui/QueryError'
import ListPagination from '../../components/ui/ListPagination'
import useListPagination from '../../hooks/useListPagination'
import {
  usePendingRecipes,
  useModerateRecipe,
} from '../../hooks/queries/useRecipeQueries'
import {
  recipeImageProps,
  handleRecipeImageError,
} from '../../lib/recipeImages'
import { formatIngredientQuantity } from '../../lib/recipeQuantities'

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã phê duyệt',
  rejected: 'Đã từ chối',
}
const difficulty = { Easy: 'Dễ', Medium: 'Trung bình', Hard: 'Khó' }

function ReviewDialog({ recipe, status, rejectInitially = false, onClose }) {
  const mutation = useModerateRecipe()
  const sending = useRef(false)
  const [reason, setReason] = useState('')
  const [rejecting, setRejecting] = useState(rejectInitially)
  const [error, setError] = useState('')
  const busy = mutation.isPending

  const submit = async (status) => {
    if (sending.current) return
    if (status === 'Rejected' && !reason.trim()) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }
    sending.current = true
    setError('')
    try {
      await mutation.mutateAsync({
        recipeId: recipe.recipeId,
        data:
          status === 'Approved'
            ? { approvalStatus: status }
            : { approvalStatus: status, rejectionReason: reason.trim() },
      })
      toast.success(
        status === 'Rejected' ? 'Đã từ chối công thức' : 'Đã duyệt công thức',
      )
      onClose()
    } catch (err) {
      setError(err?.EM || 'Không thể xử lý công thức. Vui lòng thử lại.')
    } finally {
      sending.current = false
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent
        className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-3xl"
        showCloseButton={!busy}
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault()
        }}
        onInteractOutside={(e) => {
          if (busy) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="pr-6 text-xl break-words">
            {recipe.title}
          </DialogTitle>
          <DialogDescription>
            Xem trước công thức đóng góp bởi {recipe.authorName || 'Ẩn danh'} ·{' '}
            {statusLabels[status]}
          </DialogDescription>
        </DialogHeader>
        <img
          {...recipeImageProps(recipe.thumbnailUrl)}
          onError={handleRecipeImageError}
          alt={recipe.title}
          className="max-h-64 w-full rounded-xl object-cover"
        />
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="secondary">{recipe.cookTimeMinutes} phút</Badge>
          <Badge variant="secondary">{recipe.defaultServings} khẩu phần</Badge>
          <Badge variant="secondary">
            {difficulty[recipe.difficulty] || recipe.difficulty}
          </Badge>
          {(recipe.categories || []).map((cat) => (
            <Badge key={cat.categoryId} variant="outline">
              {cat.categoryName}
            </Badge>
          ))}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">
          {recipe.description || 'Chưa có mô tả.'}
        </p>
        <section className="space-y-2">
          <h2 className="font-semibold">Nguyên liệu</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(recipe.ingredients || []).map((ing, index) => (
              <li
                key={index}
                className="rounded-lg bg-slate-100 p-3 text-sm break-words dark:bg-slate-800"
              >
                {ing.ingredientName} —{' '}
                {formatIngredientQuantity(ing.quantity, 1, ing.unit)} {ing.unit}
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold">Các bước thực hiện</h2>
          <ol className="space-y-3">
            {(recipe.cookingSteps || recipe.steps || []).map((step, index) => (
              <li
                key={step.stepNumber || index}
                className="rounded-lg border p-3 text-sm whitespace-pre-wrap break-words"
              >
                <span className="font-semibold text-orange-600">
                  Bước {step.stepNumber || index + 1}.{' '}
                </span>
                {step.instruction}
              </li>
            ))}
          </ol>
        </section>
        <div className="space-y-4 border-t pt-4" aria-busy={busy}>
          {!rejecting ? (
            <>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" disabled={busy} onClick={onClose}>
                  Đóng
                </Button>
                {status !== 'rejected' && (
                  <Button
                    variant="destructive"
                    disabled={busy}
                    onClick={() => {
                      setRejecting(true)
                      setError('')
                    }}
                  >
                    <XCircle className="size-4" />
                    {status === 'approved' ? 'Hủy duyệt / Gỡ bài' : 'Từ chối'}
                  </Button>
                )}
                {status !== 'approved' && (
                  <Button
                    disabled={busy}
                    onClick={() => submit('Approved')}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle className="size-4" />
                    )}
                    {busy
                      ? 'Đang xử lý…'
                      : status === 'rejected'
                        ? 'Duyệt lại'
                        : 'Duyệt công thức'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit('Rejected')
              }}
              className="space-y-3"
            >
              <label
                htmlFor="rejection-reason"
                className="block text-sm font-semibold"
              >
                {status === 'approved' ? 'Lý do gỡ bài' : 'Lý do từ chối'}{' '}
                <span className="text-red-600">(bắt buộc)</span>
              </label>
              <textarea
                id="rejection-reason"
                autoFocus
                required
                disabled={busy}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border bg-transparent p-3 text-sm"
                placeholder="Nêu rõ nội dung cần chỉnh sửa để tác giả bổ sung…"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setRejecting(false)
                    setError('')
                  }}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={busy || !reason.trim()}
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {busy
                    ? 'Đang xử lý…'
                    : status === 'approved'
                      ? 'Xác nhận gỡ bài'
                      : 'Xác nhận từ chối'}
                </Button>
              </div>
            </form>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminApprovalsPage() {
  const [status, setStatus] = useState('pending')
  const query = usePendingRecipes(status)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const recipes = query.data?.DT || []
  const keyword = search.trim().toLocaleLowerCase('vi')
  const filtered = recipes.filter((recipe) =>
    `${recipe.title} ${recipe.authorName || ''}`
      .toLocaleLowerCase('vi')
      .includes(keyword),
  )
  const { page, totalPages, visibleItems, setPage } = useListPagination(
    filtered,
    `${status}:${keyword}`,
    10,
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <BookOpenCheck className="h-4 w-4" />
            Kiểm duyệt nội dung
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kiểm duyệt công thức
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Xem nội dung, duyệt và tuyển chọn công thức từ cộng đồng.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {recipes.length} · {statusLabels[status]}
          </Badge>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={query.isFetching}
            onClick={() => query.refetch()}
            aria-label="Làm mới công thức kiểm duyệt"
          >
            <RefreshCw
              className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
            />
            Làm mới
          </Button>
        </div>
      </div>
      <div
        role="group"
        aria-label="Trạng thái kiểm duyệt"
        className="flex flex-wrap gap-2"
      >
        {Object.entries(statusLabels).map(([key, label]) => (
          <Button
            key={key}
            aria-pressed={status === key}
            variant={status === key ? 'default' : 'outline'}
            onClick={() => {
              setStatus(key)
              setSelected(null)
            }}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Tìm công thức hoặc tác giả"
            placeholder="Tìm theo tên món hoặc tác giả…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl bg-white pl-9 pr-10 dark:bg-slate-950"
          />
          {search && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <p role="status" className="text-sm text-slate-500">
        {query.isFetching
          ? 'Đang cập nhật danh sách…'
          : 'Danh sách tự cập nhật mỗi 30 giây và sau khi kiểm duyệt.'}
      </p>
      {query.isError ? (
        <QueryError
          title="Không thể tải công thức chờ duyệt"
          onRetry={query.refetch}
          isRetrying={query.isFetching}
        />
      ) : query.isLoading ? (
        <div role="status" className="flex justify-center gap-2 py-16">
          <Loader2 className="size-5 animate-spin" />
          Đang tải công thức…
        </div>
      ) : !filtered.length ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <CheckCircle className="mx-auto mb-3 size-10 text-green-500" />
          <h2 className="font-semibold">
            {recipes.length
              ? 'Không tìm thấy công thức phù hợp'
              : 'Không có công thức ở trạng thái ' +
                statusLabels[status].toLocaleLowerCase('vi')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {recipes.length
              ? 'Thử tìm theo tên món hoặc tác giả khác.'
              : 'Các công thức mới gửi sẽ tự động xuất hiện tại đây.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <caption className="sr-only">
                Danh sách công thức · {statusLabels[status]}
              </caption>
              <thead className="border-b bg-slate-50 text-slate-500 dark:bg-slate-900">
                <tr>
                  {[
                    'Công thức',
                    'Tác giả',
                    'Ngày gửi',
                    'Trạng thái',
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
                {visibleItems.map((recipe) => (
                  <tr
                    key={recipe.recipeId}
                    className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          {...recipeImageProps(recipe.thumbnailUrl)}
                          loading="lazy"
                          onError={handleRecipeImageError}
                          alt=""
                          className="size-14 shrink-0 rounded-lg object-cover"
                        />
                        <div>
                          <p className="max-w-72 break-words font-semibold">
                            {recipe.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {recipe.cookTimeMinutes} phút ·{' '}
                            {difficulty[recipe.difficulty] || recipe.difficulty}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 break-words">
                      {recipe.authorName || 'Ẩn danh'}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {recipe.createdAt
                        ? new Date(recipe.createdAt).toLocaleDateString(
                            'vi-VN',
                            {
                              timeZone: 'Asia/Ho_Chi_Minh',
                            },
                          )
                        : '—'}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{statusLabels[status]}</Badge>
                      {status === 'rejected' && (
                        <div className="mt-2 max-w-72 text-xs text-red-700">
                          Lý do từ chối:{' '}
                          {recipe.rejectionReason || 'Chưa có lý do'}
                          <p>
                            Ngày từ chối:{' '}
                            {recipe.rejectedAt
                              ? new Date(recipe.rejectedAt).toLocaleDateString(
                                  'vi-VN',
                                )
                              : 'Chưa có dữ liệu'}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelected(recipe)}
                        title={`Xem và kiểm duyệt ${recipe.title}`}
                      >
                        <Eye className="size-4" />
                        {status === 'pending'
                          ? 'Xem trước & Phê duyệt'
                          : status === 'rejected'
                            ? 'Duyệt lại'
                            : 'Xem chi tiết'}
                      </Button>
                      {status !== 'rejected' && (
                        <Button
                          variant="destructive"
                          className="ml-2"
                          onClick={() =>
                            setSelected({ ...recipe, rejectInitially: true })
                          }
                        >
                          {status === 'approved'
                            ? 'Hủy duyệt / Gỡ bài'
                            : 'Từ chối'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 [&_nav]:mt-0">
            <p aria-live="polite" className="text-sm text-slate-500">
              {(page - 1) * 10 + 1}–{Math.min(page * 10, filtered.length)} /{' '}
              {filtered.length} công thức
            </p>
            <ListPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
      {selected && (
        <ReviewDialog
          key={selected.recipeId}
          recipe={selected}
          status={status}
          rejectInitially={selected.rejectInitially}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

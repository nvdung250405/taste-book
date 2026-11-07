import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Tags,
  Carrot,
  Scale,
  AlertTriangle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card } from '../ui/card'
import QueryError from '../ui/QueryError'
import ListPagination from '../ui/ListPagination'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import useListPagination from '../../hooks/useListPagination'
import { normalizeMasterName } from '../../lib/masterData'
import MasterDataFormDialog from './MasterDataFormDialog'

const PAGE_ICONS = { categoryId: Tags, ingredientId: Carrot, unitId: Scale }

export default function MasterDataPage({
  title,
  label,
  idKey,
  nameKey,
  query,
  records,
  fields,
  columns,
  create,
  update,
  remove,
  references = [],
}) {
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const PageIcon = PAGE_ICONS[idKey]
  const items = records || query.data?.DT || []
  const filtered = items.filter((item) =>
    normalizeMasterName(
      [item[idKey], ...columns.map((column) => column.value(item))].join(' '),
    ).includes(normalizeMasterName(search)),
  )
  const { page, totalPages, visibleItems, setPage } = useListPagination(
    filtered,
    search,
    10,
  )
  const busy = create.isPending || update.isPending || remove.isPending
  const referencesReady = references.every((reference) => reference.isSuccess)
  const confirmDelete = () => {
    if (remove.isPending) return
    setDeleteError('')
    remove.mutate(toDelete[idKey], {
      onSuccess: () => {
        toast.success(`Đã xóa ${label}`)
        setToDelete(null)
      },
      onError: (error) =>
        setDeleteError(error?.EM || 'Không thể xóa dữ liệu. Vui lòng thử lại.'),
    })
  }
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <PageIcon className="h-4 w-4" />
            Dữ liệu hệ thống
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý dữ liệu chuẩn dùng chung trong hệ thống.
          </p>
        </div>
        <Button
          className="h-10 rounded-xl bg-orange-600 px-4 text-white shadow-sm hover:bg-orange-700 sm:self-center"
          disabled={busy || !query.isSuccess || !referencesReady}
          onClick={() => setEditor({ record: null })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm {label}
        </Button>
      </div>
      {references.map((reference, index) =>
        reference.isError ? (
          <QueryError
            key={index}
            title="Không thể tải nhóm nguyên liệu hoặc đơn vị tính"
            onRetry={reference.refetch}
            isRetrying={reference.isFetching}
          />
        ) : reference.isPending ? (
          <p key={index} role="status" className="text-sm text-slate-500">
            Đang tải dữ liệu cho biểu mẫu…
          </p>
        ) : null,
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            aria-label={`Tìm kiếm ${label}`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Tìm kiếm ${label}…`}
            className="h-11 rounded-xl bg-white pl-9 pr-10 dark:bg-slate-950"
          />
          {search && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {query.isSuccess && (
          <span className="self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
            {items.length} {label}
          </span>
        )}
      </div>
      {query.isError ? (
        <QueryError
          title={`Không thể tải ${label}`}
          onRetry={query.refetch}
          isRetrying={query.isFetching}
        />
      ) : (
        <Card className="gap-0 overflow-hidden rounded-2xl border-slate-200 py-0 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">{title}</caption>
              <thead className="border-b bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Mã
                  </th>
                  {columns.map((column) => (
                    <th key={column.label} scope="col" className="px-4 py-3">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {query.isPending ? (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="p-10 text-center"
                    >
                      <span role="status">
                        <Loader2 className="mr-2 inline h-5 w-5 animate-spin" />
                        Đang tải dữ liệu…
                      </span>
                    </td>
                  </tr>
                ) : !filtered.length ? (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="p-10 text-center text-slate-500"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Search className="h-5 w-5" />
                      </div>
                      {search
                        ? 'Không tìm thấy kết quả phù hợp.'
                        : 'Chưa có dữ liệu. Hãy thêm mới.'}
                      {search && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSearch('')}
                          >
                            Xóa tìm kiếm
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  visibleItems.map((item) => (
                    <tr
                      key={item[idKey]}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        #{item[idKey]}
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.label}
                          className="max-w-xs break-words px-4 py-3 first:font-medium"
                        >
                          {column.value(item) || '—'}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`Sửa ${item[nameKey]}`}
                          className="rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                          aria-label={`Sửa ${item[nameKey]}`}
                          disabled={busy || !referencesReady}
                          onClick={() => setEditor({ record: item })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`Xóa ${item[nameKey]}`}
                          className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                          aria-label={`Xóa ${item[nameKey]}`}
                          disabled={busy}
                          onClick={() => {
                            setDeleteError('')
                            setToDelete(item)
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
            <div className="flex flex-col gap-3 border-t bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900/30 [&_nav]:mt-0 [&_nav]:gap-2">
              <p className="text-sm text-slate-500" aria-live="polite">
                {filtered.length ? (page - 1) * 10 + 1 : 0}–
                {Math.min(page * 10, filtered.length)} / {filtered.length} kết
                quả
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
      {editor && (
        <MasterDataFormDialog
          {...{ fields, idKey, label, create, update }}
          records={items}
          record={editor.record}
          onClose={() => setEditor(null)}
          onSaved={() => {
            toast.success(
              editor.record ? 'Đã cập nhật dữ liệu' : 'Đã thêm dữ liệu',
            )
            setEditor(null)
          }}
        />
      )}
      <Dialog
        open={!!toDelete}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setToDelete(null)
        }}
      >
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto rounded-2xl"
          showCloseButton={!remove.isPending}
          onEscapeKeyDown={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (remove.isPending) event.preventDefault()
          }}
        >
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Xóa {label}?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa “{toDelete?.[nameKey]}”? Dữ liệu đang
              được sử dụng có thể không được phép xóa. Thao tác xóa thành công
              không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p role="alert" className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={remove.isPending}
              onClick={() => setToDelete(null)}
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

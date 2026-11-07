import { Button } from './button'

export default function ListPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Phân trang danh sách" className="mt-8 flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Trang trước</Button>
      <span aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">Trang {page} / {totalPages}</span>
      <Button variant="outline" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>Trang sau</Button>
    </nav>
  )
}

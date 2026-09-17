import { Scale, Construction } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'

export default function AdminUnitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Quản lý đơn vị đo</h1>
        <p className="text-slate-500">Quản lý các đơn vị đo lường dùng cho nguyên liệu</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Scale className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Đang phát triển</h2>
            <p className="text-slate-500 text-sm max-w-xs">
              Tính năng quản lý đơn vị đo đang được xây dựng và sẽ sớm ra mắt.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <Construction className="w-3.5 h-3.5" />
            <span>Sẽ hỗ trợ: thêm, sửa, xóa đơn vị đo (ml, kg, muỗng, ...)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

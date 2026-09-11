import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home, ChefHat } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
        <ChefHat className="w-12 h-12 text-primary" />
      </div>
      
      <h1 className="text-8xl md:text-9xl font-extrabold text-gray-200 tracking-tight">
        404
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-6">
        Ôi không! Bếp trống trơn rồi
      </h2>
      
      <p className="text-gray-500 mt-3 mb-8 max-w-md text-base md:text-lg">
        Công thức hoặc trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
      </p>
      
      <Button asChild size="lg" className="gap-2 rounded-full px-6">
        <Link to="/">
          <Home size={20} />
          Trở về Trang Chủ
        </Link>
      </Button>
    </div>
  )
}

export default NotFound

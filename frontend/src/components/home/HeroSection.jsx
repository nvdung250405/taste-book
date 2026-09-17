import { Search } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export default function HeroSection() {
  return (
    <section className="relative w-[100vw] ml-[calc(-50vw+50%)] h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        <Badge className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border-orange-500/30 backdrop-blur-md px-4 py-1.5 text-sm">
          Khám phá 10,000+ công thức nấu ăn
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
          Hôm nay bạn muốn <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">nấu món gì?</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl drop-shadow-md">
          Tìm kiếm nguồn cảm hứng bất tận cho bữa ăn của bạn. Từ những món ăn gia đình đơn giản đến các món Âu sang trọng.
        </p>
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl mt-4 relative flex items-center group">
          <Search className="absolute left-4 w-6 h-6 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <Input 
            type="text" 
            placeholder="Nhập tên món, nguyên liệu, ví dụ: Thịt bò, Salad..."
            className="w-full h-14 pl-14 pr-32 rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus-visible:ring-orange-500 text-lg backdrop-blur-md"
          />
          <Button className="absolute right-2 rounded-full h-10 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium">
            Tìm kiếm
          </Button>
        </div>
        
        {/* Popular tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-sm text-slate-300 mr-2">Phổ biến:</span>
          {['Thịt kho tàu', 'Canh chua', 'Bánh mì', 'Salad'].map((tag) => (
            <Badge key={tag} variant="outline" className="text-slate-300 border-white/20 hover:bg-white/10 cursor-pointer backdrop-blur-sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router'
import {
  Search,
  Star,
  Clock,
  ChefHat,
  ArrowRight,
  Flame,
  Leaf,
  Beef,
  CakeSlice,
  Salad,
  Pizza,
  Heart,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

const MOCK_CATEGORIES = [
  { id: 1, name: 'Món Á', icon: <Salad className="w-6 h-6" />, color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  { id: 2, name: 'Món Âu', icon: <Pizza className="w-6 h-6" />, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 3, name: 'Ăn Chay', icon: <Leaf className="w-6 h-6" />, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 4, name: 'Thịt', icon: <Beef className="w-6 h-6" />, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { id: 5, name: 'Tráng Miệng', icon: <CakeSlice className="w-6 h-6" />, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  { id: 6, name: 'Thịnh Hành', icon: <Flame className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
]

const MOCK_RECIPES = [
  {
    id: 1,
    title: 'Phở Bò Gia Truyền Hà Nội',
    author: 'Chef Hùng',
    rating: 4.9,
    reviews: 128,
    time: '3h',
    difficulty: 'Khó',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?q=80&w=800&auto=format&fit=crop',
    tags: ['Truyền thống', 'Bò', 'Nước'],
  },
  {
    id: 2,
    title: 'Salad Ức Gà Nướng Mật Ong',
    author: 'Healthy Life',
    rating: 4.8,
    reviews: 85,
    time: '25p',
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    tags: ['Healthy', 'Giảm cân'],
  },
  {
    id: 3,
    title: 'Bánh Mì Chảo Thập Cẩm',
    author: 'Góc Phố Vắng',
    rating: 4.7,
    reviews: 210,
    time: '15p',
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1627308595229-7830f5c90683?q=80&w=800&auto=format&fit=crop',
    tags: ['Ăn sáng', 'Nhanh'],
  },
  {
    id: 4,
    title: 'Pasta Carbonara Kiểu Ý',
    author: 'Mario Rossi',
    rating: 4.9,
    reviews: 342,
    time: '30p',
    difficulty: 'Trung bình',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800&auto=format&fit=crop',
    tags: ['Âu', 'Mì'],
  },
  {
    id: 5,
    title: 'Cá Hồi Áp Chảo Sốt Bơ Tỏi',
    author: 'Hải Sản Ngon',
    rating: 4.6,
    reviews: 94,
    time: '20p',
    difficulty: 'Trung bình',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
    tags: ['Hải sản', 'Sang trọng'],
  },
  {
    id: 6,
    title: 'Chè Khúc Bạch Thanh Mát',
    author: 'Bếp Mẹ Bon',
    rating: 4.8,
    reviews: 456,
    time: '1h',
    difficulty: 'Dễ',
    image: 'https://images.unsplash.com/photo-1555507036-ab1e4006aa49?q=80&w=800&auto=format&fit=crop',
    tags: ['Tráng miệng', 'Mùa hè'],
  },
]

function HomePage() {
  return (
    <div className="flex flex-col gap-12 pb-12 -mt-8">
      {/* Hero Section */}
      <section className="relative w-[100vw] ml-[calc(-50vw+50%)] h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/24/a2/f9/surf-turf-k-bbq-feast.jpg?w=1200&h=-1&s=1"
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

      {/* Categories Section */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Khám phá danh mục</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Lựa chọn món ăn theo sở thích của bạn</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50">
            Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_CATEGORIES.map((category) => (
            <div 
              key={category.id} 
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer group"
            >
              <div className={`p-4 rounded-full ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                {category.icon}
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{category.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="container mx-auto px-4 mt-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">Công thức nổi bật</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Những công thức được yêu thích nhất hôm nay</p>
          </div>
          <Button variant="ghost" className="hidden sm:flex text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50">
            Xem tất cả <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_RECIPES.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {/* Recipe Image with overlay */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {recipe.tags.slice(0,2).map(tag => (
                    <Badge key={tag} className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border-none">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="absolute top-4 right-4">
                  <Button size="icon" variant="secondary" className="rounded-full w-8 h-8 bg-white/80 hover:bg-white text-slate-700 backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Star className="w-4 h-4 fill-orange-500" />
                    <span className="font-semibold">{recipe.rating}</span>
                    <span className="text-slate-400 text-sm">({recipe.reviews})</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {recipe.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="w-4 h-4" /> {recipe.difficulty}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">
                  <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link>
                </h3>
                
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                    {recipe.author.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{recipe.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage

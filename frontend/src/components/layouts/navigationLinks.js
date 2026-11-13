import {
  Home,
  Compass,
  UtensilsCrossed,
  ListTodo,
  Heart,
  ShoppingCart,
} from 'lucide-react'

export const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/search', label: 'Khám phá', icon: Compass },
  {
    to: '/my-recipes',
    label: 'Công thức của tôi',
    icon: UtensilsCrossed,
    authRequired: true,
  },
  { to: '/menu', label: 'Thực đơn', icon: ListTodo, authRequired: true },
  { to: '/favorites', label: 'Yêu thích', icon: Heart, authRequired: true },
  {
    to: '/shopping-list',
    label: 'Đi chợ',
    icon: ShoppingCart,
    authRequired: true,
  },
]

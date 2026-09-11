import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { UtensilsCrossed, UserPlus } from 'lucide-react';
import { useRegister } from '../../hooks/queries/useAuthQueries';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { mutate: register, isPending: isLoading } = useRegister();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { name, emailOrPhone, password, confirmPassword } = formData;
    
    if (!name || !emailOrPhone || !password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    register(
      { name, email: emailOrPhone, password },
      {
        onSuccess: () => {
          toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
          navigate('/login');
        },
        onError: (error) => {
          toast.error(error.response?.data?.EM || 'Đăng ký thất bại');
        }
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Bên trái - Form đăng ký */}
        <div className="p-8 sm:p-12 flex flex-col justify-center order-2 md:order-1">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tạo tài khoản</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tham gia cộng đồng TasteBook ngay hôm nay
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="name">
                  Tên hiển thị
                </label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="emailOrPhone">
                  Email hoặc Số điện thoại
                </label>
                <Input 
                  id="emailOrPhone" 
                  type="text" 
                  placeholder="name@example.com" 
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Mật khẩu
                </label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="confirmPassword">
                  Xác nhận mật khẩu
                </label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                {!isLoading && <UserPlus className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>

        {/* Bên phải - Ảnh & Thương hiệu */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-8 relative overflow-hidden group order-1 md:order-2">
          {/* Ảnh nền trang trí */}
          <div className="absolute inset-0 bg-[url('/images/auth-register-bg.jpg')] bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-end gap-2 text-white">
            <span className="text-2xl font-bold tracking-tight">TasteBook</span>
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>

          <div className="relative z-10 mt-auto text-right">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium text-white/90">
                "Thực đơn đa dạng, dễ dàng tuỳ chỉnh. Mọi thứ bạn cần để trở thành đầu bếp tại gia."
              </p>
              <footer className="text-sm text-orange-400">Gia nhập cùng hàng ngàn thành viên khác</footer>
            </blockquote>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { UtensilsCrossed, ArrowRight, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success('Đã gửi email khôi phục mật khẩu!');
    }, 1200);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Left Side - Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center order-2 md:order-1">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Khôi phục mật khẩu</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isSent 
                  ? 'Kiểm tra hộp thư đến của bạn để nhận liên kết khôi phục.'
                  : 'Nhập email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.'}
              </p>
            </div>

            {!isSent ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none" htmlFor="email">
                    Địa chỉ Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2" disabled={isLoading}>
                  {isLoading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-100 dark:border-orange-900/50">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 text-orange-600 flex items-center justify-center rounded-full">
                  <MailCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Đã gửi email thành công</p>
                  <p className="text-sm text-slate-500 mt-1">Chúng tôi đã gửi liên kết khôi phục đến <br/><span className="font-medium text-slate-700 dark:text-slate-300">{email}</span></p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => setIsSent(false)}
                >
                  Gửi lại email
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-slate-500 mt-6">
              <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600 underline-offset-4 hover:underline">
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Image/Branding */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-8 relative overflow-hidden group order-1 md:order-2">
          {/* Decorative background image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="relative z-10 flex items-center justify-end gap-2 text-white">
            <span className="text-2xl font-bold tracking-tight">TasteBook</span>
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>

          <div className="relative z-10 mt-auto text-right">
            <blockquote className="space-y-2">
              <p className="text-lg font-medium text-white/90">
                "Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào căn bếp yêu thích của mình ngay thôi!"
              </p>
            </blockquote>
          </div>
        </div>

      </div>
    </div>
  );
}

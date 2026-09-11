import { UserCircle, Shield } from 'lucide-react'

export default function ProfileSidebar({ user, profileForm, activeTab, setActiveTab }) {
  return (
    <div className="md:col-span-1 space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative group w-24 h-24">
          {profileForm.avatar ? (
            <img 
              src={profileForm.avatar} 
              alt={user.name} 
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg dark:border-slate-800"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-3xl uppercase border-4 border-white shadow-lg dark:border-slate-800">
              {(user.name || 'U').charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{user.name}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'info' 
              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <UserCircle className="w-4 h-4" /> Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'security' 
              ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' 
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" /> Bảo mật & Mật khẩu
        </button>
      </div>
    </div>
  )
}

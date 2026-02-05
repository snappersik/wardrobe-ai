import Icon from '../common/Icon'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function AdminHeader({ onMenuClick }) {
    const { user } = useAuth()
    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')
    const displayName = user?.full_name || user?.username || 'Администратор'
    const subtitle = user?.role === 'admin' ? 'Super Admin' : 'Admin'

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/70 px-4 md:px-8 py-3">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Открыть меню"
                    >
                        <Icon name="menu" size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                        <Icon name="bell" size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    </button>

                    <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900">{displayName}</div>
                            <div className="text-xs text-gray-500">{subtitle}</div>
                        </div>
                        <button className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 transition-all">
                            <img
                                src={user?.avatar_path ? `${mediaBaseUrl}/${user.avatar_path}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80'}
                                alt="Admin"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

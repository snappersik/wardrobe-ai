import { NavLink } from 'react-router-dom'
import Icon from '../common/Icon'
import { useAuth } from '../../context/AuthContext'

const navItems = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', href: '/admin' },
    { id: 'editor', icon: 'pen-tool', label: 'Редактор', href: '/admin/editor' },
    { id: 'users', icon: 'users', label: 'Пользователи', href: '/admin/users' },
    { id: 'analytics', icon: 'chart-bar', label: 'Аналитика', href: '/admin' },
    { id: 'wardrobes', icon: 'hanger', label: 'Гардеробы', href: '/admin' },
    { id: 'logs', icon: 'file-text', label: 'Логи', href: '/admin/logs' },
    { id: 'settings', icon: 'settings', label: 'Настройки', href: '/profile' },
]

export default function AdminSidebar({ isOpen, onClose, activePage = 'dashboard' }) {
    const { logout } = useAuth()

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white/80 backdrop-blur-xl border-r border-white/70 shadow-sm transform transition-transform duration-300 lg:translate-x-0 ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
            <div className="flex flex-col h-full">
                <div className="h-20 flex items-center px-6 border-b border-white/70">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white shadow-sm">
                            <Icon name="hanger" size={20} />
                        </div>
                        <div className="leading-tight">
                            <span className="font-bold text-lg tracking-tight block">Умный</span>
                            <span className="font-bold text-lg tracking-tight block text-primary">Гардероб</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden ml-auto p-2 text-gray-400 hover:text-gray-600"
                        aria-label="Закрыть меню"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.id}
                            to={item.href}
                            end={item.href === '/admin'}
                            className={({ isActive }) => {
                                const active = isActive || activePage === item.id
                                return `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    active
                                        ? 'bg-white text-primary shadow-sm border border-white'
                                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
                                }`
                            }}
                        >
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/70">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <Icon name="log-out" size={18} />
                        <span className="font-medium">Выход</span>
                    </button>

                    <div className="bg-white/70 rounded-xl p-4 mt-4 border border-white/70">
                        <div className="flex items-center gap-3 mb-2">
                            <Icon name="sparkles" size={18} className="text-yellow-500" />
                            <span className="font-bold text-sm">Pro статус</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Система работает стабильно. Нагрузка 24%</p>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[24%] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

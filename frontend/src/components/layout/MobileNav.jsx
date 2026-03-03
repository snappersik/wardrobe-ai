// =============================================================================
// МОБИЛЬНАЯ НАВИГАЦИЯ (MobileNav.jsx)
// =============================================================================
// Нижняя панель навигации для мобильных устройств — glassmorphism.
// =============================================================================

import Icon from '../common/Icon';
import { Link } from 'react-router-dom'

export default function MobileNav({ activePage = 'home' }) {
    const navItems = [
        { id: 'wardrobe', icon: 'hanger', label: 'Гардероб', href: '/wardrobe' },
        { id: 'outfits', icon: 'layers', label: 'Образы', href: '/outfits' },
        { id: 'create', icon: 'plus-square', label: 'Создать', href: '/generator', isMain: true },
        { id: 'calendar', icon: 'calendar', label: 'Календарь', href: '/calendar' },
        { id: 'profile', icon: 'user', label: 'Профиль', href: '/profile' },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-white/40 pb-safe z-40 shadow-glass">
            <div className="grid grid-cols-5 h-16 items-end">
                {navItems.map((item) => {
                    const isActive = activePage === item.id

                    // Главная кнопка (Создать)
                    if (item.isMain) {
                        return (
                            <div key={item.id} className="relative flex justify-center h-full">
                                <Link
                                    to={item.href}
                                    className="absolute -top-6 w-14 h-14 bg-gradient-to-br from-primary to-pink-400 text-white rounded-2xl shadow-lg shadow-pink-300/40 flex items-center justify-center hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 active:scale-90 hover:-translate-y-0.5"
                                >
                                    <Icon name={item.icon} size={28} />
                                </Link>
                                <span className="mb-2 text-[10px] font-medium text-gray-400">{item.label}</span>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={`flex flex-col items-center justify-center gap-1 pb-2 h-full transition-all duration-200 ${isActive
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className="relative">
                                <Icon name={item.icon} size={24} />
                                {isActive && (
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

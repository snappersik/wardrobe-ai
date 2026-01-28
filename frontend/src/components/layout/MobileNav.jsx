import { Link } from 'react-router-dom'

export default function MobileNav({ activePage = 'home' }) {
    const navItems = [
        { id: 'wardrobe', icon: 'shirt', label: 'Гардероб', href: '/wardrobe' },
        { id: 'outfits', icon: 'layers', label: 'Образы', href: '/outfits' },
        { id: 'create', icon: 'plus-square', label: 'Создать', href: '/generator', isMain: true },
        { id: 'calendar', icon: 'calendar', label: 'Календарь', href: '/calendar' },
        { id: 'profile', icon: 'user', label: 'Профиль', href: '/profile' },
    ]

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40">
            <div className="grid grid-cols-5 h-16 items-end">
                {navItems.map((item) => {
                    const isActive = activePage === item.id

                    if (item.isMain) {
                        return (
                            <div key={item.id} className="relative flex justify-center h-full">
                                <Link
                                    to={item.href}
                                    className="absolute -top-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center hover:bg-primary-hover transition-transform active:scale-95"
                                >
                                    <div className={`icon-${item.icon} w-7 h-7`}></div>
                                </Link>
                                <span className="mb-2 text-[10px] font-medium text-gray-400">{item.label}</span>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            className={`flex flex-col items-center justify-center gap-1 pb-2 h-full transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <div className={`icon-${item.icon} w-6 h-6`}></div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function UniversalHeader({ user }) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
        document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'unset'
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
        document.body.style.overflow = 'unset'
    }

    // Определяем роль пользователя
    const isAdmin = user?.isAdmin
    const isAuthenticated = !!user

    // Навигация для неавторизованных пользователей
    const navLinksUnauth = [
        { name: 'Возможности', href: '/#features' },
        { name: 'Как это работает', href: '/#how-it-works' },
        { name: 'Отзывы', href: '/#testimonials' },
    ]

    // Навигация для авторизованных пользователей (не админов)
    const navLinksAuth = [
        { name: 'Гардероб', href: '/wardrobe' },
        { name: 'Образы', href: '/outfits' },
        { name: 'Календарь', href: '/calendar' },
        { name: 'Профиль', href: '/profile' },
    ]

    // Навигация для админов
    const navLinksAdmin = [
        { name: 'Дашборд', href: '/admin' },
        { name: 'Пользователи', href: '/admin/users' },
        { name: 'Логи', href: '/admin/logs' },
        { name: 'Профиль', href: '/profile' },
    ]

    // Выбираем нужные ссылки
    const links = isAdmin ? navLinksAdmin : (isAuthenticated ? navLinksAuth : navLinksUnauth)

    const isActive = (href) => {
        if (href.startsWith('/#')) return false
        if (href === '/') return location.pathname === '/'
        // Для /admin проверяем точное совпадение, чтобы не подсвечивался при /admin/users
        if (href === '/admin') return location.pathname === '/admin'
        return location.pathname.startsWith(href)
    }

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5'
                    : 'bg-white/0'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'
                        }`}>

                        {/* Логотип */}
                        <Link
                            to="/"
                            className="flex items-center gap-3 group"
                        >
                            <div className={`rounded-full bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center text-white shadow-lg shadow-pink-200/50 transition-all duration-300 group-hover:scale-105 ${isScrolled ? 'w-9 h-9' : 'w-11 h-11'
                                }`}>
                                <svg className={`transition-all duration-300 ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 5a3 3 0 1 1 5.1 2.1l-1.5 1.5A2 2 0 0 0 12 10v1" />
                                    <path d="M4 21a2 2 0 0 1-1.1-3.7L12 11l9.2 6.4A2 2 0 0 1 20 21Z" />
                                </svg>
                            </div>
                            <span className={`font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'
                                }`}>
                                Умный Гардероб
                            </span>
                        </Link>

                        {/* Десктопная навигация */}
                        <nav className="hidden md:flex items-center gap-1">
                            {links.map((link) => {
                                // Обработка якорных ссылок для плавного скролла
                                const isAnchor = link.href.includes('#')

                                const handleClick = (e) => {
                                    if (isAnchor) {
                                        const id = link.href.split('#')[1]
                                        const element = document.getElementById(id)
                                        if (element) {
                                            e.preventDefault()
                                            element.scrollIntoView({ behavior: 'smooth' })
                                        }
                                    }
                                }

                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={handleClick}
                                        className={`group relative px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isActive(link.href)
                                            ? 'text-primary bg-pink-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        {link.name}
                                        {/* Animated underline: dot expands to line on hover */}
                                        <span className={`absolute bottom-0 left-1/2 h-1 bg-primary rounded-full transition-all duration-300 ease-out ${isActive(link.href)
                                            ? 'w-1 -translate-x-1/2 group-hover:w-3/4'
                                            : 'w-0 -translate-x-1/2 group-hover:w-3/4'
                                            }`} />
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* Правая часть */}
                        <div className="flex items-center gap-3">
                            {/* Незарегистрированный пользователь — кнопка Войти */}
                            {!isAuthenticated && (
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-pink-400 text-white px-6 py-2.5 rounded-full font-medium shadow-md shadow-pink-200/60 hover:shadow-lg hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Войти
                                </Link>
                            )}

                            {/* Авторизованный пользователь (не админ) — кнопка Создать */}
                            {isAuthenticated && !isAdmin && (
                                <Link
                                    to="/generator"
                                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-primary to-pink-400 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Создать
                                </Link>
                            )}

                            {/* Админ — кнопка Админ панель */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-2.5 rounded-full font-medium shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Админ панель
                                </Link>
                            )}

                            {/* Мобильное меню кнопка */}
                            <button
                                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={toggleMobileMenu}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Спейсер */}
            <div className={`transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`} />

            {/* Мобильное меню */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeMobileMenu}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        {/* Заголовок */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-100">
                            <span className="font-bold text-xl">Меню</span>
                            <button
                                onClick={closeMobileMenu}
                                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Профиль пользователя */}
                        {isAuthenticated && (
                            <div className={`p-6 flex items-center gap-4 ${isAdmin ? 'bg-gradient-to-br from-violet-50 to-purple-50' : 'bg-gradient-to-br from-pink-50 to-purple-50'}`}>
                                <img
                                    src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"}
                                    alt="User"
                                    className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg"
                                />
                                <div>
                                    <div className="font-bold text-gray-900 text-lg">{user.name || 'Анна Петрова'}</div>
                                    <div className="text-sm text-gray-500">{isAdmin ? 'Администратор 🛡️' : 'Premium Plan ✨'}</div>
                                </div>
                            </div>
                        )}

                        {/* Навигация */}
                        <div className="flex-1 overflow-y-auto py-4">
                            {isAuthenticated ? (
                                <div className="space-y-1 px-3">
                                    {links.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.href}
                                            onClick={closeMobileMenu}
                                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${isActive(link.href)
                                                ? `${isAdmin ? 'bg-violet-500' : 'bg-primary'} text-white shadow-lg ${isAdmin ? 'shadow-purple-200/50' : 'shadow-pink-200/50'}`
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-6 py-8 text-center">
                                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Добро пожаловать!</h3>
                                    <p className="text-gray-500 text-sm">Войдите, чтобы управлять своим гардеробом</p>
                                </div>
                            )}

                            {/* Кнопка создать для авторизованных (не админов) */}
                            {isAuthenticated && !isAdmin && (
                                <div className="mt-6 px-3">
                                    <Link
                                        to="/generator"
                                        onClick={closeMobileMenu}
                                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-pink-400 text-white py-4 rounded-2xl font-bold shadow-xl shadow-pink-200/50 active:scale-95 transition-transform"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        Создать образ
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Футер меню */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            {isAuthenticated ? (
                                <Link
                                    to="/"
                                    onClick={closeMobileMenu}
                                    className="flex items-center justify-center gap-2 w-full text-red-600 font-medium py-3 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Выйти
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className="flex items-center justify-center w-full py-4 rounded-xl bg-gradient-to-r from-primary to-pink-400 text-white font-bold shadow-lg shadow-pink-200/50"
                                >
                                    Войти
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

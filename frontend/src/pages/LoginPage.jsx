// =============================================================================
// СТРАНИЦА ВХОДА (LoginPage.jsx)
// =============================================================================
// Страница авторизации пользователя.
// Использует split-layout: слева - брендинг, справа - форма входа.
// =============================================================================

// React хук для работы с состоянием
import { useState } from 'react'

// Link для навигации
import { Link } from 'react-router-dom'

// Компоненты страницы входа
import LoginBranding from '../components/auth/LoginBranding'  // Левая панель с брендингом
import LoginForm from '../components/auth/LoginForm'          // Форма входа
import Toast from '../components/common/Toast'                // Всплывающие уведомления
import Icon from '../components/common/Icon'                  // Иконки

// =============================================================================
// КОМПОНЕНТ СТРАНИЦЫ
// =============================================================================
export default function LoginPage() {
    // Состояние для Toast уведомлений
    const [toast, setToast] = useState(null)

    /**
     * Показывает Toast уведомление.
     * Автоматически скрывается через 3 секунды.
     * 
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип: 'success' | 'error'
     */
    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => setToast(null), 3000)
    }

    // ==========================================================================
    // РЕНДЕР СТРАНИЦЫ
    // ==========================================================================
    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50 relative">

            {/* ============================================================= */}
            {/* КНОПКА "НАЗАД" */}
            {/* ============================================================= */}
            {/* Возврат на главную страницу */}
            <Link
                to="/"
                className="absolute top-6 left-6 p-2 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <Icon name="arrow-left" size={20} />
                <span className="text-sm font-medium hidden sm:inline">На главную</span>
            </Link>

            {/* ============================================================= */}
            {/* КАРТОЧКА ВХОДА (split-layout) */}
            {/* ============================================================= */}
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px]">

                {/* --------------------------------------------------------- */}
                {/* ЛЕВАЯ ПАНЕЛЬ: Брендинг */}
                {/* --------------------------------------------------------- */}
                {/* Красивая картинка и название приложения */}
                <div className="w-full md:w-1/2 bg-gray-50 relative overflow-hidden">
                    <LoginBranding />
                </div>

                {/* --------------------------------------------------------- */}
                {/* ПРАВАЯ ПАНЕЛЬ: Форма входа */}
                {/* --------------------------------------------------------- */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <LoginForm showToast={showToast} />
                </div>

            </div>

            {/* Toast уведомление (показывается при входе/ошибке) */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

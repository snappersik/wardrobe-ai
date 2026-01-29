// =============================================================================
// КОМПОНЕНТ ERROR BOUNDARY (ErrorBoundary.jsx)
// =============================================================================
// ErrorBoundary - специальный компонент для перехвата ошибок в React.
// Если в дочерних компонентах происходит ошибка, показывает fallback UI
// вместо "белого экрана смерти".
// =============================================================================

// Component - базовый класс для классовых компонентов
// (Error Boundary требует классовый компонент, не работает с функциональными)
import { Component } from 'react'

// =============================================================================
// КЛАСС ERROR BOUNDARY
// =============================================================================
/**
 * Компонент для обработки ошибок в дереве React.
 * 
 * Оборачивает всё приложение и перехватывает JavaScript ошибки
 * в методах жизненного цикла и рендере дочерних компонентов.
 * 
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
    /**
     * Конструктор компонента.
     * Инициализирует состояние: hasError (была ли ошибка), error (объект ошибки).
     */
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    /**
     * Статический метод, вызываемый при возникновении ошибки.
     * Обновляет состояние, чтобы следующий рендер показал fallback UI.
     * 
     * @param {Error} error - Объект ошибки
     * @returns {Object} - Новое состояние компонента
     */
    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    /**
     * Lifecycle метод для логирования ошибок.
     * Вызывается после того, как ошибка была "поймана".
     * 
     * @param {Error} error - Объект ошибки
     * @param {Object} errorInfo - Информация о компоненте, где произошла ошибка
     */
    componentDidCatch(error, errorInfo) {
        // Логируем ошибку в консоль (можно отправить в сервис мониторинга)
        console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack)
    }

    /**
     * Метод рендеринга.
     * Показывает либо fallback UI (при ошибке), либо дочерние компоненты.
     */
    render() {
        // Если произошла ошибка - показываем fallback UI
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h1>
                        <p className="text-gray-600 mb-4">Мы сожалеем, но произошла непредвиденная ошибка.</p>
                        {/* Кнопка перезагрузки страницы */}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            Обновить страницу
                        </button>
                    </div>
                </div>
            )
        }

        // Если ошибки нет - рендерим дочерние компоненты
        return this.props.children
    }
}

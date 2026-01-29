// =============================================================================
// КОМПОНЕНТ TOAST (Toast.jsx)
// =============================================================================
// Toast (всплывающее уведомление) для отображения сообщений.
// Показывается в правом верхнем углу экрана.
// Поддерживает два типа: success (успех) и error (ошибка).
// =============================================================================

// Компонент иконок
import Icon from './Icon'

// =============================================================================
// КОМПОНЕНТ TOAST
// =============================================================================
/**
 * Всплывающее уведомление.
 * 
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления: 'success' | 'error'
 * @param {function} onClose - Callback при закрытии
 * 
 * @example
 * <Toast 
 *   message="Успешный вход!" 
 *   type="success" 
 *   onClose={() => setToast(null)} 
 * />
 */
export default function Toast({ message, type = 'success', onClose }) {
    // Цвет фона в зависимости от типа
    const bgColor = type === 'success' ? 'bg-black' : 'bg-red-500'

    // Иконка в зависимости от типа
    // success -> галочка, error -> крестик
    const iconName = type === 'success' ? 'check' : 'x'

    return (
        // Позиционируем в правом верхнем углу
        // animate-bounce-in - анимация появления
        <div className="fixed top-6 right-6 z-50 animate-bounce-in">
            <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px]`}>
                {/* Иконка типа сообщения */}
                <Icon name={iconName} className="text-white" size={20} />

                {/* Текст сообщения */}
                <p className="font-medium">{message}</p>

                {/* Кнопка закрытия */}
                <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
                    <Icon name="x" className="text-white" size={16} />
                </button>
            </div>
        </div>
    )
}

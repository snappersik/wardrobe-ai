// =============================================================================
// ГРУППА ВВОДА (InputGroup.jsx)
// =============================================================================
// Переиспользуемый компонент для полей ввода формы.
// Включает label, иконку внутри поля, обработку ошибок.
// Используется в формах входа и регистрации.
// =============================================================================

// Компонент иконок
import Icon from '../common/Icon'

// =============================================================================
// КОМПОНЕНТ INPUT GROUP
// =============================================================================
/**
 * Группа поля ввода с label и иконкой.
 * 
 * @param {string} label - Текст метки над полем
 * @param {string} name - Имя поля (для формы)
 * @param {string} type - Тип input: 'text' | 'email' | 'password' и т.д.
 * @param {string} icon - Название иконки (из Icon.jsx)
 * @param {string} placeholder - Подсказка внутри поля
 * @param {string} value - Текущее значение
 * @param {function} onChange - Обработчик изменения
 * @param {string} error - Текст ошибки (если есть)
 * 
 * @example
 * <InputGroup
 *   label="Email"
 *   name="email"
 *   type="email"
 *   icon="mail"
 *   placeholder="example@mail.com"
 *   value={email}
 *   onChange={handleChange}
 *   error={errors.email}
 * />
 */
export default function InputGroup({ label, name, type = "text", icon, placeholder, value, onChange, error }) {
    // Динамические классы для input
    // При ошибке: красная рамка и фон
    // Без ошибки: обычные стили с фокусом на primary цвет
    const inputClassName = `w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-primary'
        }`

    return (
        <div>
            {/* Label над полем */}
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">{label}</label>

            {/* Контейнер для input с иконкой */}
            <div className="relative">
                {/* Иконка слева внутри input */}
                <Icon name={icon} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                {/* Поле ввода */}
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={inputClassName}
                />
            </div>

            {/* Текст ошибки (показывается если есть) */}
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
    )
}

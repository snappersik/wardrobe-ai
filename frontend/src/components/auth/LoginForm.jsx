// =============================================================================
// ФОРМА ВХОДА (LoginForm.jsx)
// =============================================================================
// Компонент формы авторизации.
// Поддерживает валидацию, показ/скрытие пароля и вход через соцсети.
// =============================================================================

// React хук для работы с состоянием
import { useState } from 'react'

// Хуки React Router для навигации
import { Link, useNavigate } from 'react-router-dom'

// Компоненты формы
import InputGroup from './InputGroup'     // Поле ввода с иконкой
import SocialLogin from './SocialLogin'   // Кнопки входа через соцсети
import Icon from '../common/Icon'         // Иконки

// Хук авторизации для вызова login
import { useAuth } from '../../context/AuthContext'

// =============================================================================
// КОМПОНЕНТ ФОРМЫ ВХОДА
// =============================================================================
/**
 * Форма входа в систему.
 * 
 * @param {function} showToast - Функция для показа уведомлений
 */
export default function LoginForm({ showToast }) {
    // Функция навигации
    const navigate = useNavigate()

    // Функция входа из контекста авторизации
    const { login } = useAuth()

    // Флаг загрузки (для блокировки формы во время отправки)
    const [loading, setLoading] = useState(false)

    // Показывать ли пароль как текст
    const [showPassword, setShowPassword] = useState(false)

    // Данные формы
    const [formData, setFormData] = useState({
        email: '',      // Email или username
        password: '',   // Пароль
        remember: false // Запомнить меня
    })

    // Ошибки валидации
    const [errors, setErrors] = useState({})

    /**
     * Обработчик изменения полей формы.
     * Обновляет состояние и очищает ошибки для изменённого поля.
     * 
     * @param {Event} e - Событие change от input
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            // Для checkbox используем checked, для остальных - value
            [name]: type === 'checkbox' ? checked : value
        }))
        // Очищаем ошибку при изменении поля
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    /**
     * Валидация формы.
     * Проверяет email и пароль на заполненность и корректность.
     * 
     * @returns {boolean} - true если форма валидна
     */
    const validate = () => {
        const newErrors = {}

        // Проверка email
        if (!formData.email) {
            newErrors.email = 'Введите email или логин'
        }

        // Проверка пароля
        if (!formData.password) {
            newErrors.password = 'Введите пароль'
        }

        setErrors(newErrors)
        // Форма валидна если нет ошибок
        return Object.keys(newErrors).length === 0
    }

    /**
     * Отправка формы (вход в систему).
     * Вызывает login из AuthContext и редиректит в гардероб.
     * 
     * @param {Event} e - Событие submit формы
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Валидируем форму
        if (!validate()) return

        setLoading(true)
        try {
            // Вызываем функцию входа
            const userData = await login(formData.email, formData.password)

            // Показываем уведомление об успехе
            showToast('Успешный вход!')

            // Редирект в зависимости от роли через 1 секунду
            setTimeout(() => {
                if (userData.role === 'admin') {
                    navigate('/admin')
                } else {
                    navigate('/wardrobe')
                }
            }, 1000)
        } catch (error) {
            console.error(error)
            // Показываем ошибку
            showToast('Неверный логин или пароль', 'error')
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // РЕНДЕР ФОРМЫ
    // ==========================================================================
    return (
        <div>
            {/* Заголовок формы */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход в аккаунт</h1>
                <p className="text-gray-500">Добро пожаловать назад! Пожалуйста, введите свои данные.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Поле Email */}
                <InputGroup
                    label="Email или логин"
                    name="email"
                    type="text"
                    icon="mail"
                    placeholder="example@mail.com или username"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

                {/* Поле Пароль (с кнопкой показа/скрытия) */}
                <div>
                    <div className="relative">
                        <InputGroup
                            label="Пароль"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            icon="lock"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />
                        {/* Кнопка показа/скрытия пароля */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                        >
                            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                        </button>
                    </div>
                </div>

                {/* Чекбокс "Запомнить меня" и ссылка восстановления пароля */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary accent-primary"
                        />
                        <span className="text-sm text-gray-600">Запомнить меня</span>
                    </label>
                    <Link to="#" className="text-sm text-primary hover:underline font-medium">Забыли пароль?</Link>
                </div>

                {/* Кнопка входа */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3.5 text-lg font-bold shadow-xl shadow-pink-200 hover:shadow-2xl hover:shadow-pink-300 transform hover:-translate-y-0.5 transition-all"
                >
                    {loading ? (
                        // Спиннер загрузки
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        'Войти'
                    )}
                </button>

                {/* Разделитель "или" */}
                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">или</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Кнопки входа через соцсети */}
                <SocialLogin />

                {/* Ссылка на регистрацию */}
                <p className="text-center text-gray-600 text-sm mt-8">
                    Нет аккаунта? <Link to="/register" className="text-primary font-bold hover:underline">Зарегистрироваться</Link>
                </p>

            </form>
        </div>
    )
}

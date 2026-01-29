// Страница регистрации - двухшаговая форма (имя+email -> пароль)
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/common/Icon'
import LoginBranding from '../components/auth/LoginBranding'
import Toast from '../components/common/Toast'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [toast, setToast] = useState(null)
    const [step, setStep] = useState(1)           // Текущий шаг (1 или 2)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)           // Показать пароль
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)  // Показать подтверждение
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [errors, setErrors] = useState({})

    // Показать toast уведомление
    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Обработчик изменения полей
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    // Валидация шага 1 (имя и email)
    const validateStep1 = () => {
        const newErrors = {}
        if (!formData.name) newErrors.name = 'Введите имя'
        if (!formData.email) newErrors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Валидация шага 2 (пароли)
    const validateStep2 = () => {
        const newErrors = {}
        if (!formData.password) newErrors.password = 'Введите пароль'
        else if (formData.password.length < 6) newErrors.password = 'Пароль должен быть не менее 6 символов'
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтвердите пароль'
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Переход на следующий шаг
    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2)
        }
    }

    // Отправка формы регистрации
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateStep2()) return

        setLoading(true)
        try {
            await register({
                username: formData.email.split('@')[0] + Math.floor(Math.random() * 10000),
                email: formData.email,
                password: formData.password,
                full_name: formData.name
            })
            showToast('Регистрация успешна!')
            setTimeout(() => navigate('/wardrobe'), 1000)
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.detail || 'Ошибка регистрации'
            showToast(msg, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50 relative">
            <Link
                to="/"
                className="absolute top-6 left-6 p-2 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <Icon name="arrow-left" size={20} />
                <span className="text-sm font-medium hidden sm:inline">На главную</span>
            </Link>

            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px]">
                <div className="w-full md:w-1/2 bg-gray-50 relative overflow-hidden">
                    <LoginBranding />
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-8">
                        {/* Индикатор шагов */}
                        <div className="flex gap-2 mb-6">
                            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {step === 1 ? 'Создать аккаунт' : 'Установить пароль'}
                        </h1>
                        <p className="text-gray-500">
                            {step === 1 ? 'Начните путь к идеальному стилю' : 'Придумайте надёжный пароль'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ваше имя"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="example@mail.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-full btn btn-primary py-3.5 text-lg font-bold"
                                >
                                    Продолжить
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Icon name={showPassword ? "eye-off" : "eye"} size={20} />
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтверждение пароля</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} />
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 btn btn-outline py-3.5"
                                    >
                                        Назад
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 btn btn-primary py-3.5 font-bold"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        ) : 'Создать'}
                                    </button>
                                </div>
                            </>
                        )}

                        <p className="text-center text-gray-600 text-sm mt-8">
                            Уже есть аккаунт? <Link to="/login" className="text-primary font-bold hover:underline">Войти</Link>
                        </p>
                    </form>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

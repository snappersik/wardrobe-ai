import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import InputGroup from './InputGroup'
import SocialLogin from './SocialLogin'
import Icon from '../common/Icon'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm({ showToast }) {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    })
    const [errors, setErrors] = useState({})

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.email) newErrors.email = 'Введите email'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Некорректный email'

        if (!formData.password) newErrors.password = 'Введите пароль'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            await login(formData.email, formData.password)
            showToast('Успешный вход!')
            setTimeout(() => {
                navigate('/wardrobe')
            }, 1000)
        } catch (error) {
            console.error(error)
            showToast('Неверный логин или пароль', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход в аккаунт</h1>
                <p className="text-gray-500">Добро пожаловать назад! Пожалуйста, введите свои данные.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                <InputGroup
                    label="Email"
                    name="email"
                    type="email"
                    icon="mail"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                />

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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600"
                        >
                            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={formData.remember}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-600">Запомнить меня</span>
                    </label>
                    <Link to="#" className="text-sm text-primary hover:underline font-medium">Забыли пароль?</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3.5 text-lg font-bold shadow-xl shadow-pink-200 hover:shadow-2xl hover:shadow-pink-300 transform hover:-translate-y-0.5 transition-all"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                        'Войти'
                    )}
                </button>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">или</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <SocialLogin />

                <p className="text-center text-gray-600 text-sm mt-8">
                    Нет аккаунта? <Link to="/register" className="text-primary font-bold hover:underline">Зарегистрироваться</Link>
                </p>

            </form>
        </div>
    )
}

import { useState, useEffect, useRef } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import Toast from '../components/common/Toast'
import { useAuth } from '../context/AuthContext'
import Icon from '../components/common/Icon'
import cities from '../data/russian-cities.json'

export default function ProfilePage() {
    const { user, logout, updateProfile, deleteAccount } = useAuth()
    const [toast, setToast] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        phone: '',
        city: '',
        notifications: true
    })

    // Заполняем форму данными пользователя при загрузке
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                name: user.full_name || '',
                email: user.email || '',
                city: user.city || '',
            }))
        }
    }, [user])

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // Проверка города из списка
    const handleCityBlur = (e) => {
        const { value } = e.target
        if (value && !cities.find(c => c.name === value)) {
            showToast('Пожалуйста, выберите город из списка', 'error')
            setFormData(prev => ({ ...prev, city: '' }))
        }
    }

    // Загрузка аватара
    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const objectUrl = URL.createObjectURL(file)
            setFormData(prev => ({ ...prev, avatarPreview: objectUrl }))
            showToast('Фото выбрано', 'success')
            return () => URL.revokeObjectURL(objectUrl)
        }
    }

    // Сохранение профиля
    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateProfile({
                username: formData.username,
                email: formData.email,
                full_name: formData.name,
                city: formData.city
            })
            showToast('Профиль успешно обновлён!')
        } catch (error) {
            console.error(error)
            showToast(error.response?.data?.detail || 'Ошибка сохранения', 'error')
        } finally {
            setLoading(false)
        }
    }

    // Удаление аккаунта
    const handleDeleteAccount = async () => {
        try {
            await deleteAccount()
        } catch (error) {
            showToast('Не удалось удалить аккаунт', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="profile" user={user} />

            <main className="flex-grow container mx-auto max-w-2xl px-4 md:px-6 py-6">
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <img
                                src={formData.avatarPreview || user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.full_name || user?.username || 'User')}
                                alt={user?.name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 h-8 w-8 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center"
                            >
                                <Icon name="camera" size={16} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.full_name || user?.username}</h1>
                            <p className="text-gray-500">{user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-primary rounded-full text-sm font-medium">
                                Free Plan
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Логин (username)</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя (Full Name)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Город</label>
                                <input
                                    type="text"
                                    name="city"
                                    list="city-list"
                                    value={formData.city}
                                    onChange={handleChange}
                                    onBlur={handleCityBlur}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="Начните вводить название..."
                                />
                                <datalist id="city-list">
                                    {cities.map((city, index) => (
                                        <option key={`${city.name}-${index}`} value={city.name} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="notifications"
                                    checked={formData.notifications}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-gray-700">Получать уведомления о новых образах</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3.5 font-bold"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : 'Сохранить изменения'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-1">Настройки аккаунта</h3>
                        <p className="text-sm text-gray-500">Управление безопасностью и выходом</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={logout}
                            className="btn btn-outline px-6 py-2"
                        >
                            Выйти
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="btn bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2 border-none"
                        >
                            Удалить аккаунт
                        </button>
                    </div>
                </div>
            </main>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icon name="alert-triangle" size={32} className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">Удалить аккаунт?</h2>
                        <p className="text-gray-500 text-center mb-8">
                            Это действие нельзя отменить. Все ваши данные будут безвозвратно удалены.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 btn btn-outline py-3"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white py-3 border-none"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MobileNav activePage="profile" />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

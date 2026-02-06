import { useEffect, useRef, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Icon from '../../components/common/Icon'
import Toast from '../../components/common/Toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

export default function AdminSettingsPage() {
    const { user, updateProfile } = useAuth()
    const [name, setName] = useState('')
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const fileInputRef = useRef(null)
    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    useEffect(() => {
        if (!user) return
        setName(user.full_name || '')
        setAvatarPreview(user.avatar_path ? `${mediaBaseUrl}/${user.avatar_path}` : null)
    }, [user, mediaBaseUrl])

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const objectUrl = URL.createObjectURL(file)
        setAvatarPreview(objectUrl)
        showToast('Фото выбрано', 'success')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (fileInputRef.current?.files?.[0]) {
                const avatarFormData = new FormData()
                avatarFormData.append('file', fileInputRef.current.files[0])

                await api.post('/users/me/avatar', avatarFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }

            await updateProfile({ full_name: name })
            showToast('Настройки сохранены')
        } catch (error) {
            console.error(error)
            showToast(error.response?.data?.detail || 'Ошибка сохранения', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AdminLayout activePage="settings">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Настройки администратора</h1>
            </div>

            <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 p-6 md:p-8 max-w-3xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Icon name="settings" size={20} />
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Данные администратора</div>
                        <div className="text-lg font-semibold text-gray-900">Имя и аватар</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img
                                src={avatarPreview || 'https://ui-avatars.com/api/?name=Admin&background=f1f5f9&color=0f172a'}
                                alt="Admin avatar"
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 h-9 w-9 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors flex items-center justify-center"
                                aria-label="Сменить аватар"
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
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                placeholder="Введите имя администратора"
                            />
                            <p className="text-xs text-gray-400 mt-2">Логин, email и город недоступны для изменения.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary px-6 py-3.5 font-bold"
                    >
                        {loading ? 'Сохраняем...' : 'Сохранить изменения'}
                    </button>
                </form>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AdminLayout>
    )
}

// =============================================================================
// СТРАНИЦА ОБРАЗОВ (OutfitsPage.jsx)
// =============================================================================
// Страница отображения сохранённых образов пользователя.
// Позволяет фильтровать по поводу (повседневный, офис, вечеринка и т.д.)
// =============================================================================

// React хуки для работы с состоянием и эффектами
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Компоненты layout
import UniversalHeader from '../components/layout/UniversalHeader'  // Шапка
import MobileNav from '../components/layout/MobileNav'              // Мобильная навигация
import OutfitsFAB from '../components/outfits/OutfitsFAB'           // Плавающая кнопка (новая)
import Icon from '../components/common/Icon'
import Toast from '../components/common/Toast'

// API клиент
import api from '../api/axios'

// Хук авторизации
import { useAuth } from '../context/AuthContext'

// Категории одежды для валидации
import clothingCategories from '../data/clothing-categories.json'

// =============================================================================
// КОМПОНЕНТ СТРАНИЦЫ
// =============================================================================
export default function OutfitsPage() {
    // Данные текущего пользователя
    const { user } = useAuth()
    const navigate = useNavigate()

    // ==========================================================================
    // СОСТОЯНИЯ
    // ==========================================================================

    // Список образов (загружается с сервера)
    const [outfits, setOutfits] = useState([])

    // Список вещей в гардеробе (для валидации)
    const [wardrobeItems, setWardrobeItems] = useState([])

    // Флаг загрузки
    const [loading, setLoading] = useState(true)

    // Активный фильтр по поводу
    const [activeOccasion, setActiveOccasion] = useState('Все')

    // Toast уведомление
    const [toast, setToast] = useState(null)

    // Модальное окно выбора создания
    const [showChoiceModal, setShowChoiceModal] = useState(false)

    // Список возможных поводов для фильтрации
    // Список возможных поводов для фильтрации
    const occasions = ['Все', 'Повседневный', 'Офис', 'Вечеринка', 'Спорт', 'Свидание']

    // Состояние для удаления
    const [outfitToDelete, setOutfitToDelete] = useState(null)

    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    // ==========================================================================
    // ЗАГРУЗКА ДАННЫХ
    // ==========================================================================
    useEffect(() => {
        fetchOutfits()
        fetchWardrobeItems()
    }, [])

    const fetchOutfits = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/outfits/my-outfits')
            const detailed = await Promise.all(data.map(async (outfit) => {
                try {
                    const detail = await api.get(`/outfits/${outfit.id}`)
                    return detail.data
                } catch (error) {
                    return outfit
                }
            }))

            const mappedOutfits = detailed.map(outfit => ({
                id: outfit.id,
                name: outfit.name || 'Без названия',
                occasion: outfit.target_season || 'Повседневный',
                itemsCount: Array.isArray(outfit.items) ? outfit.items.length : 0,
                previewItems: Array.isArray(outfit.items) ? outfit.items.slice(0, 4) : [],
                date: new Date(outfit.created_at).toLocaleDateString()
            }))

            setOutfits(mappedOutfits)
        } catch (error) {
            console.error('Failed to fetch outfits', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchWardrobeItems = async () => {
        try {
            const { data } = await api.get('/clothing')
            setWardrobeItems(data)
        } catch (error) {
            console.error('Failed to fetch wardrobe items', error)
        }
    }

    // Проверка наличия минимального количества вещей
    const getCategoryType = (categoryId) => {
        const cat = clothingCategories.find(c => c.id === categoryId)
        return cat?.type || 'other'
    }

    const checkMinimumItems = () => {
        const hasTop = wardrobeItems.some(item => {
            const type = getCategoryType(item.category)
            return type === 'top' || type === 'full'
        })

        const hasBottom = wardrobeItems.some(item => {
            const type = getCategoryType(item.category)
            return type === 'bottom' || type === 'full'
        })

        return hasTop && hasBottom
    }

    const handleInsufficientItems = () => {
        setToast({
            message: 'Для создания образа нужна минимум 1 вещь верха и 1 вещь низа (или платье)',
            type: 'warning'
        })
    }

    const handleCreateClick = () => {
        if (checkMinimumItems()) {
            setShowChoiceModal(true)
        } else {
            handleInsufficientItems()
        }
    }

    const handleDeleteClick = (e, outfit) => {
        e.stopPropagation()
        setOutfitToDelete(outfit)
    }

    const confirmDelete = async () => {
        if (!outfitToDelete) return
        try {
            await api.delete(`/outfits/${outfitToDelete.id}`)
            setOutfits(prev => prev.filter(o => o.id !== outfitToDelete.id))
            setToast({ message: 'Образ удалён', type: 'success' })
        } catch (error) {
            console.error('Failed to delete outfit', error)
            setToast({ message: 'Не удалось удалить образ', type: 'error' })
        } finally {
            setOutfitToDelete(null)
        }
    }

    // ==========================================================================
    // ФИЛЬТРАЦИЯ
    // ==========================================================================
    const filteredOutfits = outfits.filter(outfit =>
        activeOccasion === 'Все' || outfit.occasion === activeOccasion
    )

    // ==========================================================================
    // РЕНДЕР СТРАНИЦЫ
    // ==========================================================================
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Шапка с навигацией */}
            <UniversalHeader activePage="outfits" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">

                {/* ЗАГОЛОВОК И СЧЁТЧИК */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мои образы</h1>
                        <p className="text-gray-500 text-sm">Всего образов: {filteredOutfits.length}</p>
                    </div>
                </div>

                {/* ФИЛЬТР ПО ПОВОДАМ */}
                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-2">
                        {occasions.map(occasion => (
                            <button
                                key={occasion}
                                onClick={() => setActiveOccasion(occasion)}
                                className={`pill ${activeOccasion === occasion ? 'pill-active' : 'pill-inactive'}`}
                            >
                                {occasion}
                            </button>
                        ))}
                    </div>
                </div>

                {/* КОНТЕНТ */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white rounded-2xl p-4 h-80 animate-pulse">
                                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredOutfits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Icon name="layers" size={96} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Нет сохранённых образов</h3>
                        <p className="text-gray-500 max-w-xs mb-8">Создайте свой первый образ вручную или с помощью AI генератора</p>
                        <button
                            onClick={handleCreateClick}
                            className="btn btn-primary px-8"
                        >
                            Создать образ
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
                        {filteredOutfits.map(outfit => (
                            <div
                                key={outfit.id}
                                onClick={() => navigate(`/outfits/${outfit.id}`)}
                                className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover cursor-pointer"
                            >
                                <div className="relative h-48 bg-gray-50 p-3">
                                    <div className="grid grid-cols-2 gap-2 h-full">
                                        {outfit.previewItems.length > 0 ? (
                                            outfit.previewItems.map((item, idx) => {
                                                const showMoreOverlay = idx === 3 && outfit.itemsCount > 4
                                                return (
                                                    <div key={item.id || idx} className="relative rounded-xl overflow-hidden bg-gray-100">
                                                        <img
                                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                                            alt={item.filename || outfit.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                        {showMoreOverlay && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
                                                                +{outfit.itemsCount - 4}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="col-span-2 h-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                                                Нет превью
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                            {outfit.occasion}
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteClick(e, outfit)}
                                            className="p-1 px-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors"
                                            title="Удалить образ"
                                        >
                                            <Icon name="trash" size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{outfit.name}</h3>
                                    <p className="text-sm text-gray-500">{outfit.itemsCount} вещей</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Плавающая кнопка действия */}
            <OutfitsFAB
                wardrobeItems={wardrobeItems}
                onInsufficientItems={handleInsufficientItems}
            />

            {/* Мобильная навигация */}
            <MobileNav activePage="outfits" />

            {/* Модалка выбора типа создания */}
            {showChoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-center mb-6">Как создать образ?</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => { setShowChoiceModal(false); navigate('/outfits/create'); }}
                                className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow">
                                    <Icon name="hanger" size={24} className="text-gray-700" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">Вручную</p>
                                    <p className="text-sm text-gray-500">Соберите образ сами</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setShowChoiceModal(false); navigate('/generator'); }}
                                className="w-full flex items-center gap-4 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                            >
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow">
                                    <Icon name="wand-sparkles" size={24} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-gray-900">AI Генератор</p>
                                    <p className="text-sm text-gray-500">ИИ подберёт образ</p>
                                </div>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowChoiceModal(false)}
                            className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            )}

            {/* Модальное окно подтверждения удаления */}
            {outfitToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon name="trash" size={24} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-center mb-2">Удалить образ?</h2>
                        <p className="text-gray-500 text-center text-sm mb-6">
                            Образ "{outfitToDelete.name}" будет удалён безвозвратно.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOutfitToDelete(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 font-medium shadow-lg shadow-red-200"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast уведомление */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

// =============================================================================
// СТРАНИЦА СОЗДАНИЯ ОБРАЗА ВРУЧНУЮ (OutfitCreatePage.jsx)
// =============================================================================
// Страница для ручного сбора образа из вещей гардероба.
// Пользователь выбирает вещи и составляет комплект.
// =============================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Компоненты layout
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import Toast from '../components/common/Toast'
import Icon from '../components/common/Icon'

// API и авторизация
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

// Категории одежды
import clothingCategories from '../data/clothing-categories.json'

// =============================================================================
// КОМПОНЕНТ СТРАНИЦЫ
// =============================================================================
export default function OutfitCreatePage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    // ==========================================================================
    // СОСТОЯНИЯ
    // ==========================================================================
    const [wardrobeItems, setWardrobeItems] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [outfitName, setOutfitName] = useState('')
    const [occasion, setOccasion] = useState('Повседневный')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [activeTab, setActiveTab] = useState('top')

    const occasions = ['Повседневный', 'Офис', 'Вечеринка', 'Спорт', 'Свидание']

    // ==========================================================================
    // ЗАГРУЗКА ДАННЫХ
    // ==========================================================================
    useEffect(() => {
        fetchWardrobeItems()
    }, [])

    const fetchWardrobeItems = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/clothing')
            setWardrobeItems(data)
        } catch (error) {
            console.error('Failed to fetch wardrobe items', error)
            setToast({ message: 'Не удалось загрузить гардероб', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // ХЕЛПЕРЫ
    // ==========================================================================
    const getCategoryType = (categoryId) => {
        const cat = clothingCategories.find(c => c.id === categoryId)
        return cat?.type || 'other'
    }

    const getCategoryName = (categoryId) => {
        const cat = clothingCategories.find(c => c.id === categoryId)
        return cat?.name || categoryId
    }

    // Группировка вещей по типу
    const groupedItems = {
        top: wardrobeItems.filter(i => getCategoryType(i.category) === 'top'),
        bottom: wardrobeItems.filter(i => getCategoryType(i.category) === 'bottom'),
        full: wardrobeItems.filter(i => getCategoryType(i.category) === 'full'),
        shoes: wardrobeItems.filter(i => getCategoryType(i.category) === 'shoes'),
        accessory: wardrobeItems.filter(i => getCategoryType(i.category) === 'accessory'),
        other: wardrobeItems.filter(i => getCategoryType(i.category) === 'other')
    }

    const tabs = [
        { id: 'top', name: 'Верх', icon: 'shirt', count: groupedItems.top.length },
        { id: 'bottom', name: 'Низ', icon: 'trousers', count: groupedItems.bottom.length },
        { id: 'full', name: 'Платья', icon: 'dress', count: groupedItems.full.length },
        { id: 'shoes', name: 'Обувь', icon: 'footprints', count: groupedItems.shoes.length },
        { id: 'accessory', name: 'Аксессуары', icon: 'shopping-bag', count: groupedItems.accessory.length }
    ]

    // Проверка выбрана ли вещь
    const isSelected = (item) => selectedItems.some(i => i.id === item.id)

    // Переключение выбора вещи
    const toggleItem = (item) => {
        if (isSelected(item)) {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id))
        } else {
            setSelectedItems(prev => [...prev, item])
        }
    }

    // Валидация образа (минимум верх + низ или полный)
    const validateOutfit = () => {
        const hasTop = selectedItems.some(i => getCategoryType(i.category) === 'top')
        const hasBottom = selectedItems.some(i => getCategoryType(i.category) === 'bottom')
        const hasFull = selectedItems.some(i => getCategoryType(i.category) === 'full')

        return hasFull || (hasTop && hasBottom)
    }

    // ==========================================================================
    // СОХРАНЕНИЕ
    // ==========================================================================
    const handleSave = async () => {
        if (!validateOutfit()) {
            setToast({
                message: 'Выберите минимум 1 вещь верха и 1 вещь низа (или платье)',
                type: 'warning'
            })
            return
        }

        setSaving(true)
        try {
            await api.post('/outfits/create', {
                name: outfitName || `Образ ${new Date().toLocaleDateString()}`,
                target_season: occasion,
                item_ids: selectedItems.map(i => i.id)
            })
            setToast({ message: 'Образ сохранён!', type: 'success' })
            setTimeout(() => navigate('/outfits'), 1000)
        } catch (error) {
            console.error('Failed to save outfit', error)
            setToast({ message: 'Не удалось сохранить образ', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    // ==========================================================================
    // РЕНДЕР
    // ==========================================================================
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="outfits" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Icon name="arrow-left" size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Создание образа</h1>
                            <p className="text-gray-500 text-sm">Выберите вещи для образа</p>
                        </div>
                    </div>
                </div>

                {/* Основной контент - два столбца */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ЛЕВАЯ ЧАСТЬ - Выбор вещей */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                        {/* Табы категорий */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <Icon name={tab.icon} size={18} />
                                    {tab.name}
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                                        }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Сетка вещей */}
                        {loading ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <div key={n} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : groupedItems[activeTab]?.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Icon name="inbox" size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>Нет вещей в этой категории</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                {groupedItems[activeTab]?.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleItem(item)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected(item)
                                            ? 'border-primary ring-2 ring-primary/20 scale-95'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={`${api.defaults.baseURL.replace('/api', '')}/${item.image_path}`}
                                            alt={item.filename}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image' }}
                                        />
                                        {isSelected(item) && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                                                    <Icon name="check" size={20} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ - Превью образа */}
                    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 h-fit sticky top-24">
                        <h3 className="font-bold text-gray-900 mb-4">Ваш образ</h3>

                        {/* Превью выбранных вещей */}
                        {selectedItems.length === 0 ? (
                            <div className="aspect-square bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 mb-4">
                                <Icon name="layers" size={48} className="mb-2" />
                                <p className="text-sm">Выберите вещи слева</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {selectedItems.map(item => (
                                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={`${api.defaults.baseURL.replace('/api', '')}/${item.image_path}`}
                                            alt={item.filename}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=?' }}
                                        />
                                        <button
                                            onClick={() => toggleItem(item)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                            <Icon name="x" size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Название образа */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                            <input
                                type="text"
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                placeholder="Мой крутой образ"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        {/* Повод */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Повод</label>
                            <select
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            >
                                {occasions.map(o => (
                                    <option key={o} value={o}>{o}</option>
                                ))}
                            </select>
                        </div>

                        {/* Валидация */}
                        {selectedItems.length > 0 && !validateOutfit() && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <Icon name="alert-triangle" size={16} className="inline mr-1" />
                                Добавьте верх и низ (или платье)
                            </div>
                        )}

                        {/* Кнопка сохранения */}
                        <button
                            onClick={handleSave}
                            disabled={selectedItems.length === 0 || saving || !validateOutfit()}
                            className="w-full btn btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Сохраняем...</span>
                                </div>
                            ) : (
                                <>
                                    <Icon name="save" size={18} className="inline mr-2" />
                                    Сохранить образ
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <MobileNav activePage="outfits" />
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

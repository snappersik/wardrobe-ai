// =============================================================================
// СТРАНИЦА ГАРДЕРОБА (WardrobePage.jsx)
// =============================================================================
// Главная страница гардероба пользователя.
// Отображает все вещи с возможностью фильтрации, поиска и сортировки.
// =============================================================================

// React хуки для работы с состоянием и эффектами
import { useState, useEffect, useRef } from 'react'

// Компоненты layout (шапка и мобильная навигация)
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'

// Компоненты гардероба
import WardrobeHeader from '../components/wardrobe/WardrobeHeader'     // Заголовок с поиском
import CategoryFilter from '../components/wardrobe/CategoryFilter'     // Фильтр по категориям
import WardrobeGrid from '../components/wardrobe/WardrobeGrid'         // Сетка карточек
import WardrobeFAB from '../components/wardrobe/WardrobeFAB'           // Плавающая кнопка (новая)
import UploadModal from '../components/wardrobe/UploadModal'           // Модалка загрузки
import ItemEditModal from '../components/wardrobe/ItemEditModal'       // Модалка редактирования после загрузки
import Icon from '../components/common/Icon'

// API клиент для запросов
import api from '../api/axios'

// Хук авторизации для получения данных пользователя
import { useAuth } from '../context/AuthContext'

// Категории одежды (для фильтров)
import clothingCategories from '../data/clothing-categories.json'

// Цвета и стили (для фильтров)
const COLORS = [
    { id: 'black', name: 'Чёрный', hex: '#000000' },
    { id: 'white', name: 'Белый', hex: '#FFFFFF' },
    { id: 'gray', name: 'Серый', hex: '#9CA3AF' },
    { id: 'red', name: 'Красный', hex: '#EF4444' },
    { id: 'orange', name: 'Оранжевый', hex: '#F97316' },
    { id: 'yellow', name: 'Жёлтый', hex: '#EAB308' },
    { id: 'green', name: 'Зелёный', hex: '#22C55E' },
    { id: 'blue', name: 'Синий', hex: '#3B82F6' },
    { id: 'purple', name: 'Фиолетовый', hex: '#A855F7' },
    { id: 'pink', name: 'Розовый', hex: '#EC4899' },
    { id: 'brown', name: 'Коричневый', hex: '#92400E' },
    { id: 'beige', name: 'Бежевый', hex: '#D4B896' }
]

const STYLES = [
    { id: 'casual', name: 'Повседневный' },
    { id: 'formal', name: 'Деловой' },
    { id: 'sport', name: 'Спортивный' },
    { id: 'party', name: 'Вечерний' },
    { id: 'street', name: 'Уличный' }
]

// =============================================================================
// КОМПОНЕНТ СТРАНИЦЫ
// =============================================================================
export default function WardrobePage() {
    // Получаем данные текущего пользователя из контекста
    const { user } = useAuth()

    // ==========================================================================
    // СОСТОЯНИЯ КОМПОНЕНТА
    // ==========================================================================

    // Массив вещей из гардероба (загружается с сервера)
    const [items, setItems] = useState([])

    // Флаг загрузки (для показа скелетона)
    const [loading, setLoading] = useState(true)

    // Состояние модального окна загрузки
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

    // Режим загрузки: 'gallery' или 'camera'
    const [uploadMode, setUploadMode] = useState('gallery')

    // Активная категория для фильтрации
    const [activeCategory, setActiveCategory] = useState('Все')

    // Поисковый запрос
    const [searchQuery, setSearchQuery] = useState('')

    // Опция сортировки (newest/oldest)
    const [sortOption, setSortOption] = useState('newest')

    // Загруженная вещь для редактирования
    const [uploadedItem, setUploadedItem] = useState(null)

    // Модальное окно редактирования
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    // Фильтры (цвет, стиль, категории)
    const [filters, setFilters] = useState({
        categories: [],
        colors: [],
        styles: []
    })
    const [showFilters, setShowFilters] = useState(false)

    // Восстанавливаем фильтры из localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem('wardrobeFilters')
            if (!raw) return
            const parsed = JSON.parse(raw)
            setFilters({
                categories: Array.isArray(parsed?.categories) ? parsed.categories : [],
                colors: Array.isArray(parsed?.colors) ? parsed.colors : [],
                styles: Array.isArray(parsed?.styles) ? parsed.styles : []
            })
        } catch (error) {
            console.warn('Failed to load wardrobeFilters', error)
        }
    }, [])

    // Сохраняем фильтры в localStorage
    useEffect(() => {
        try {
            localStorage.setItem('wardrobeFilters', JSON.stringify(filters))
        } catch (error) {
            console.warn('Failed to save wardrobeFilters', error)
        }
    }, [filters])

    // ==========================================================================
    // ЗАГРУЗКА ДАННЫХ ПРИ МОНТИРОВАНИИ
    // ==========================================================================
    useEffect(() => {
        fetchItems()
    }, [])

    /**
     * Загружает список вещей с сервера.
     * Вызывается при монтировании компонента и после загрузки новой вещи.
     */
    const fetchItems = async () => {
        try {
            setLoading(true)
            // Добавляем слеш, чтобы избежать 307 Redirect и потери порта
            const { data } = await api.get('/clothing/')
            setItems(data)
        } catch (error) {
            console.error('Failed to fetch items', error)
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // ОБРАБОТЧИКИ FAB
    // ==========================================================================
    const handleCameraClick = () => {
        setUploadMode('camera')
        setIsUploadModalOpen(true)
    }

    const handleGalleryClick = () => {
        setUploadMode('gallery')
        setIsUploadModalOpen(true)
    }

    // ==========================================================================
    // ФИЛЬТРАЦИЯ И СОРТИРОВКА
    // ==========================================================================
    // Фильтруем вещи по категории и поисковому запросу
    const filteredItems = items.filter(item => {
        // Проверка совпадения категории
        const getCategoryType = (categoryId) => {
            const cat = clothingCategories.find(c => c.id === categoryId)
            return cat?.type || 'other'
        }

        const categoryTypeMap = {
            'Верх': ['top'],
            'Низ': ['bottom'],
            'Обувь': ['shoes'],
            'Верхняя одежда': ['top'],
            'Аксессуары': ['accessory'],
            'Платья': ['full']
        }

        const type = getCategoryType(item.category)
        const matchesCategory = activeCategory === 'Все' || (categoryTypeMap[activeCategory] || []).includes(type)

        // Проверка совпадения поискового запроса (по названию, описанию или имени файла)
        const itemName = item.name || item.filename || ''
        const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

        const parseList = (value) => {
            if (!value) return []
            if (Array.isArray(value)) return value
            if (typeof value === 'string') {
                try {
                    const parsed = JSON.parse(value)
                    return Array.isArray(parsed) ? parsed : [value]
                } catch (error) {
                    return [value]
                }
            }
            return []
        }

        const itemColors = parseList(item.color)
        const itemStyles = parseList(item.style)

        const matchesColor = filters.colors.length === 0 || itemColors.some(c => filters.colors.includes(c))
        const matchesStyle = filters.styles.length === 0 || itemStyles.some(s => filters.styles.includes(s))
        const matchesCategoryFilter = filters.categories.length === 0 || filters.categories.includes(item.category)

        return matchesCategory && matchesSearch && matchesColor && matchesStyle && matchesCategoryFilter
    }).sort((a, b) => {
        // Сортировка по дате создания
        if (sortOption === 'newest') return new Date(b.created_at) - new Date(a.created_at)
        if (sortOption === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
        return 0
    })

    /**
     * Удаляет вещь из гардероба.
     * Подтверждение удаления теперь в WardrobeCard.
     * 
     * @param {number} id - ID вещи для удаления
     */
    const handleDelete = async (id) => {
        try {
            // DELETE /api/clothing/{id}
            await api.delete(`/clothing/${id}`)
            // Удаляем вещь из локального состояния
            setItems(prev => prev.filter(item => item.id !== id))
        } catch (error) {
            console.error('Failed to delete item', error)
            alert('Не удалось удалить вещь')
        }
    }

    /**
     * Открывает модальное окно редактирования для существующей вещи.
     * 
     * @param {Object} item - Вещь для редактирования
     */
    const handleEdit = (item) => {
        setUploadedItem(item)
        setIsEditModalOpen(true)
    }

    // ==========================================================================
    // РЕНДЕР СТРАНИЦЫ
    // ==========================================================================
    const categoryNameById = (id) => clothingCategories.find(c => c.id === id)?.name || id
    const colorNameById = (id) => COLORS.find(c => c.id === id)?.name || id
    const styleNameById = (id) => STYLES.find(s => s.id === id)?.name || id

    const hasActiveFilters = filters.categories.length + filters.colors.length + filters.styles.length > 0

    const removeFilterChip = (type, id) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].filter(v => v !== id)
        }))
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Универсальная шапка (навигация) */}
            <UniversalHeader activePage="wardrobe" user={user} />

            {/* Основной контент */}
            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                {/* Заголовок с поиском и сортировкой */}
                <WardrobeHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    itemCount={filteredItems.length}
                    onOpenFilters={() => setShowFilters(true)}
                    hasActiveFilters={hasActiveFilters}
                />

                {/* Быстрые чипсы активных фильтров */}
                {hasActiveFilters && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {filters.categories.map(catId => (
                            <button
                                key={`cat-${catId}`}
                                onClick={() => removeFilterChip('categories', catId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-gray-300"
                            >
                                {categoryNameById(catId)}
                                <Icon name="x" size={14} />
                            </button>
                        ))}
                        {filters.colors.map(colorId => (
                            <button
                                key={`color-${colorId}`}
                                onClick={() => removeFilterChip('colors', colorId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-gray-300"
                            >
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.find(c => c.id === colorId)?.hex || '#9CA3AF' }} />
                                {colorNameById(colorId)}
                                <Icon name="x" size={14} />
                            </button>
                        ))}
                        {filters.styles.map(styleId => (
                            <button
                                key={`style-${styleId}`}
                                onClick={() => removeFilterChip('styles', styleId)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-gray-300"
                            >
                                {styleNameById(styleId)}
                                <Icon name="x" size={14} />
                            </button>
                        ))}
                        <button
                            onClick={() => setFilters({ categories: [], colors: [], styles: [] })}
                            className="px-3 py-1.5 rounded-full text-sm text-gray-500 hover:text-gray-700"
                        >
                            Сбросить все
                        </button>
                    </div>
                )}

                {/* Фильтр по категориям (футболки, штаны, обувь и т.д.) */}
                <CategoryFilter
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                {/* Сетка карточек с вещами */}
                <WardrobeGrid
                    items={filteredItems}
                    loading={loading}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onAddClick={handleGalleryClick}
                />
            </main>

            {/* FAB - Плавающая кнопка действия (добавить вещь) */}
            <WardrobeFAB
                onCameraClick={handleCameraClick}
                onGalleryClick={handleGalleryClick}
            />

            {/* Мобильная навигация (для экранов < md) */}
            <MobileNav activePage="wardrobe" />

            {/* Модальное окно загрузки фото */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                initialMode={uploadMode}
                onUploadSuccess={(item) => {
                    // После успешной загрузки открываем редактор
                    setUploadedItem(item)
                    setIsEditModalOpen(true)
                }}
            />

            {/* Модальное окно редактирования вещи */}
            <ItemEditModal
                isOpen={isEditModalOpen}
                item={uploadedItem}
                onSave={() => {
                    setIsEditModalOpen(false)
                    setUploadedItem(null)
                    fetchItems()
                }}
                onClose={async () => {
                    // Если это pending вещь (не сохранена в БД) - отменяем загрузку
                    if (uploadedItem?.pending && uploadedItem?.file_id) {
                        try {
                            await api.delete(`/clothing/cancel/${uploadedItem.file_id}`)
                        } catch (error) {
                            console.error('Failed to cancel upload', error)
                        }
                    }
                    setIsEditModalOpen(false)
                    setUploadedItem(null)
                    // НЕ вызываем fetchItems() при отмене - ничего не изменилось
                }}
            />

            {showFilters && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
                            <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        {/* Категории */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Категории</p>
                            <div className="flex flex-wrap gap-2">
                                {clothingCategories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setFilters(prev => {
                                            const exists = prev.categories.includes(cat.id)
                                            return {
                                                ...prev,
                                                categories: exists ? prev.categories.filter(c => c !== cat.id) : [...prev.categories, cat.id]
                                            }
                                        })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.categories.includes(cat.id)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Цвета */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Цвета</p>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => setFilters(prev => {
                                            const exists = prev.colors.includes(color.id)
                                            return {
                                                ...prev,
                                                colors: exists ? prev.colors.filter(c => c !== color.id) : [...prev.colors, color.id]
                                            }
                                        })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filters.colors.includes(color.id)
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color.hex }} />
                                        {color.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Стили */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-gray-700 mb-2">Стили</p>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setFilters(prev => {
                                            const exists = prev.styles.includes(style.id)
                                            return {
                                                ...prev,
                                                styles: exists ? prev.styles.filter(s => s !== style.id) : [...prev.styles, style.id]
                                            }
                                        })}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filters.styles.includes(style.id)
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setFilters({ categories: [], colors: [], styles: [] })}
                                className="text-gray-500 text-sm hover:text-gray-700"
                            >
                                Сбросить фильтры
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
                            >
                                Готово
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

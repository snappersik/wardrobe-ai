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

// API клиент для запросов
import api from '../api/axios'

// Хук авторизации для получения данных пользователя
import { useAuth } from '../context/AuthContext'

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
            const { data } = await api.get('/clothing')
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
        const matchesCategory = activeCategory === 'Все' || item.category === activeCategory

        // Проверка совпадения поискового запроса (по названию, описанию или имени файла)
        const itemName = item.name || item.filename || ''
        const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

        return matchesCategory && matchesSearch
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
                />

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
        </div>
    )
}

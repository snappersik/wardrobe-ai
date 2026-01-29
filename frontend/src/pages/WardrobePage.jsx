// =============================================================================
// СТРАНИЦА ГАРДЕРОБА (WardrobePage.jsx)
// =============================================================================
// Главная страница гардероба пользователя.
// Отображает все вещи с возможностью фильтрации, поиска и сортировки.
// =============================================================================

// React хуки для работы с состоянием и эффектами
import { useState, useEffect } from 'react'

// Компоненты layout (шапка и мобильная навигация)
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'

// Компоненты гардероба
import WardrobeHeader from '../components/wardrobe/WardrobeHeader'     // Заголовок с поиском
import CategoryFilter from '../components/wardrobe/CategoryFilter'     // Фильтр по категориям
import WardrobeGrid from '../components/wardrobe/WardrobeGrid'         // Сетка карточек
import FAB from '../components/wardrobe/FAB'                           // Плавающая кнопка
import UploadModal from '../components/wardrobe/UploadModal'           // Модалка загрузки

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

    // Активная категория для фильтрации
    const [activeCategory, setActiveCategory] = useState('Все')

    // Поисковый запрос
    const [searchQuery, setSearchQuery] = useState('')

    // Опция сортировки (newest/oldest)
    const [sortOption, setSortOption] = useState('newest')

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
            // GET /api/clothing - получаем все вещи текущего пользователя
            const { data } = await api.get('/clothing')
            setItems(data)
        } catch (error) {
            console.error('Failed to fetch items', error)
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // ФИЛЬТРАЦИЯ И СОРТИРОВКА
    // ==========================================================================
    // Фильтруем вещи по категории и поисковому запросу
    const filteredItems = items.filter(item => {
        // Проверка совпадения категории
        const matchesCategory = activeCategory === 'Все' || item.category === activeCategory

        // Проверка совпадения поискового запроса (по названию или описанию)
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
     * 
     * @param {number} id - ID вещи для удаления
     */
    const handleDelete = async (id) => {
        // Подтверждение удаления
        if (confirm('Вы уверены, что хотите удалить эту вещь?')) {
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
                    onUploadClick={() => setIsUploadModalOpen(true)}
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
                />
            </main>

            {/* FAB - Плавающая кнопка действия (создать образ) */}
            <FAB />

            {/* Мобильная навигация (для экранов < md) */}
            <MobileNav activePage="wardrobe" />

            {/* Модальное окно загрузки фото */}
            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    // После успешной загрузки обновляем список вещей
                    fetchItems()
                }}
            />
        </div>
    )
}

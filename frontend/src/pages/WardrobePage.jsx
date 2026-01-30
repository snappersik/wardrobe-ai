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
            // MOCK DATA for demonstration
            const MOCK_ITEMS = [
                { id: 1, name: 'Белая футболка', category: 'Верх', image: 'https://www.nt-nn.com/_data/resources/img/thumbnails/13961.61_10_1000x1000.jpg', created_at: new Date().toISOString() },
                { id: 2, name: 'Синие джинсы', category: 'Низ', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRefjgrkoYyvVz4ccyF2i1ebhT_sG8jlRU_yw&s', created_at: new Date(Date.now() - 86400000).toISOString() },
                { id: 3, name: 'Кожаная куртка', category: 'Верх', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8xpRrLUyN81TxF98h7ulvViC2M2Pb3juqbA&s', created_at: new Date(Date.now() - 172800000).toISOString() },
                { id: 4, name: 'Белые кеды', category: 'Обувь', image: 'https://respect-shoes.ru/upload/iblock/14e/owzr7qaw4tkh2vnpcs2jthzwcs3yxc2k.JPG', created_at: new Date(Date.now() - 259200000).toISOString() },
                { id: 5, name: 'Летнее платье', category: 'Платья', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=60', created_at: new Date(Date.now() - 345600000).toISOString() },
                { id: 6, name: 'Черная сумка', category: 'Аксессуары', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=60', created_at: new Date(Date.now() - 432000000).toISOString() },
            ];

            // Simulate API delay
            setTimeout(() => {
                setItems(MOCK_ITEMS)
            }, 500);

            // COMMENTED OUT REAL API CALL
            // const { data } = await api.get('/clothing')
            // setItems(data)
        } catch (error) {
            console.error('Failed to fetch items', error)
        } finally {
            // setLoading(false) - moved inside timeout above in real app, but here effectively instant
            setTimeout(() => setLoading(false), 500)
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

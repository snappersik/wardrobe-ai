// =============================================================================
// СТРАНИЦА ОБРАЗОВ (OutfitsPage.jsx)
// =============================================================================
// Страница отображения сохранённых образов пользователя.
// Позволяет фильтровать по поводу (повседневный, офис, вечеринка и т.д.)
// =============================================================================

// React хуки для работы с состоянием и эффектами
import { useState, useEffect } from 'react'

// Компоненты layout
import UniversalHeader from '../components/layout/UniversalHeader'  // Шапка
import MobileNav from '../components/layout/MobileNav'              // Мобильная навигация
import FAB from '../components/wardrobe/FAB'                        // Плавающая кнопка

// API клиент
import api from '../api/axios'

// Хук авторизации
import { useAuth } from '../context/AuthContext'

// =============================================================================
// КОМПОНЕНТ СТРАНИЦЫ
// =============================================================================
export default function OutfitsPage() {
    // Данные текущего пользователя
    const { user } = useAuth()

    // ==========================================================================
    // СОСТОЯНИЯ
    // ==========================================================================

    // Список образов (загружается с сервера)
    const [outfits, setOutfits] = useState([])

    // Флаг загрузки
    const [loading, setLoading] = useState(true)

    // Активный фильтр по поводу
    const [activeOccasion, setActiveOccasion] = useState('Все')

    // Список возможных поводов для фильтрации
    const occasions = ['Все', 'Повседневный', 'Офис', 'Вечеринка', 'Спорт', 'Свидание']

    // ==========================================================================
    // ЗАГРУЗКА ДАННЫХ
    // ==========================================================================
    useEffect(() => {
        fetchOutfits()
    }, [])

    /**
     * Загружает список образов с сервера.
     * Преобразует данные бекенда в формат для UI.
     */
    const fetchOutfits = async () => {
        try {
            setLoading(true)
            // GET /api/outfits/my-outfits
            const { data } = await api.get('/outfits/my-outfits')

            // Маппинг данных бекенда в формат UI
            // Бекенд возвращает: { id, name, target_season, items, created_at }
            const mappedOutfits = data.map(outfit => ({
                id: outfit.id,
                name: outfit.name || 'Без названия',
                // target_season используем как occasion (пока нет отдельного поля)
                occasion: outfit.target_season || 'Повседневный',
                // Количество вещей в образе
                items: outfit.items ? outfit.items.length : '?',
                // Заглушка для изображения (TODO: добавить реальное превью)
                image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=300',
                // Форматирование даты создания
                date: new Date(outfit.created_at).toLocaleDateString()
            }))

            setOutfits(mappedOutfits)
        } catch (error) {
            console.error('Failed to fetch outfits', error)
        } finally {
            setLoading(false)
        }
    }

    // ==========================================================================
    // ФИЛЬТРАЦИЯ
    // ==========================================================================
    // Фильтруем образы по выбранному поводу
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

                {/* ========================================================= */}
                {/* ЗАГОЛОВОК И СЧЁТЧИК */}
                {/* ========================================================= */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мои образы</h1>
                        <p className="text-gray-500 text-sm">Всего образов: {filteredOutfits.length}</p>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* ФИЛЬТР ПО ПОВОДАМ */}
                {/* ========================================================= */}
                {/* Горизонтальный скролл на мобильных устройствах */}
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

                {/* ========================================================= */}
                {/* КОНТЕНТ: Загрузка / Пустое состояние / Сетка образов */}
                {/* ========================================================= */}
                {loading ? (
                    // Скелетон загрузки
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
                    // Пустое состояние - нет образов
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <div className="icon-layers text-gray-300 w-24 h-24"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Нет сохранённых образов</h3>
                        <p className="text-gray-500 max-w-xs mb-8">Создайте свой первый образ с помощью AI генератора</p>
                        <button className="btn btn-primary px-8">Создать образ</button>
                    </div>
                ) : (
                    // Сетка карточек образов
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
                        {filteredOutfits.map(outfit => (
                            <div key={outfit.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                                {/* Изображение образа */}
                                <div className="relative h-48 bg-gray-100">
                                    <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
                                    {/* Бейдж с поводом */}
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                        {outfit.occasion}
                                    </div>
                                </div>
                                {/* Информация об образе */}
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{outfit.name}</h3>
                                    <p className="text-sm text-gray-500">{outfit.items} вещей</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Плавающая кнопка действия */}
            <FAB />

            {/* Мобильная навигация */}
            <MobileNav activePage="outfits" />
        </div>
    )
}

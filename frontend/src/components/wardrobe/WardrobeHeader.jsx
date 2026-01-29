// =============================================================================
// ЗАГОЛОВОК ГАРДЕРОБА (WardrobeHeader.jsx)
// =============================================================================
// Верхняя часть страницы гардероба.
// Содержит заголовок, счётчик вещей, поле поиска и кнопку добавления.
// =============================================================================

// Компонент иконок
import Icon from '../common/Icon'

// =============================================================================
// КОМПОНЕНТ ЗАГОЛОВКА
// =============================================================================
/**
 * Заголовок страницы гардероба с поиском и действиями.
 * 
 * @param {string} searchQuery - Текущий поисковый запрос
 * @param {function} setSearchQuery - Функция для обновления поискового запроса
 * @param {string} sortOption - Текущая опция сортировки
 * @param {function} setSortOption - Функция для изменения сортировки
 * @param {number} itemCount - Количество вещей (для отображения в счётчике)
 * @param {function} onUploadClick - Callback при клике на кнопку "Добавить"
 */
export default function WardrobeHeader({ searchQuery, setSearchQuery, sortOption, setSortOption, itemCount, onUploadClick }) {
    return (
        // Флекс-контейнер: колонка на мобильных, ряд на десктопе
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

            {/* ============================================================= */}
            {/* ЗАГОЛОВОК И СЧЁТЧИК */}
            {/* ============================================================= */}
            <div>
                {/* Заголовок виден только на десктопе */}
                <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мой гардероб</h1>
                {/* Счётчик вещей */}
                <p className="text-gray-500 text-sm">Всего вещей: {itemCount}</p>
            </div>

            {/* ============================================================= */}
            {/* ДЕЙСТВИЯ И ПОИСК */}
            {/* ============================================================= */}
            <div className="flex gap-3 w-full md:w-auto">

                {/* --------------------------------------------------------- */}
                {/* КНОПКА "ДОБАВИТЬ" (только десктоп) */}
                {/* --------------------------------------------------------- */}
                <button
                    onClick={onUploadClick}
                    className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium shadow-lg shadow-pink-200/50 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    {/* Иконка плюса */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Добавить
                </button>

                {/* --------------------------------------------------------- */}
                {/* ПОЛЕ ПОИСКА */}
                {/* --------------------------------------------------------- */}
                <div className="relative flex-grow md:w-64">
                    <input
                        type="text"
                        placeholder="Поиск вещи..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    />
                    {/* Иконка поиска внутри input */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon name="search" size={16} />
                    </div>
                </div>

                {/* --------------------------------------------------------- */}
                {/* КНОПКА ФИЛЬТРОВ */}
                {/* --------------------------------------------------------- */}
                {/* TODO: Добавить функционал фильтрации */}
                <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors">
                    <Icon name="sliders-horizontal" size={20} />
                </button>
            </div>
        </div>
    )
}

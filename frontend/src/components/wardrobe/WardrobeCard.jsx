// =============================================================================
// КАРТОЧКА ВЕЩИ (WardrobeCard.jsx)
// =============================================================================
// Компонент карточки одной вещи в гардеробе.
// Отображает изображение, название и категорию.
// При наведении показываются кнопки редактирования и удаления.
// =============================================================================

/**
 * Карточка вещи в гардеробе.
 * 
 * @param {Object} item - Данные вещи
 * @param {number} item.id - ID вещи
 * @param {string} item.image - URL изображения
 * @param {string} item.name - Название вещи
 * @param {string} item.category - Категория (Верх, Низ, Обувь и т.д.)
 * @param {function} onDelete - Callback для удаления вещи
 */
export default function WardrobeCard({ item, onDelete }) {
    return (
        // Контейнер карточки с hover-эффектами
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 card-hover group relative">

            {/* ============================================================= */}
            {/* ИЗОБРАЖЕНИЕ ВЕЩИ */}
            {/* ============================================================= */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-50">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />

                {/* --------------------------------------------------------- */}
                {/* КНОПКИ ДЕЙСТВИЙ (появляются при наведении) */}
                {/* --------------------------------------------------------- */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Кнопка редактирования */}
                    <button className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-700">
                        <div className="icon-pencil w-4 h-4"></div>
                    </button>

                    {/* Кнопка удаления */}
                    <button
                        // e.stopPropagation() предотвращает срабатывание клика на карточке
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-red-500"
                    >
                        <div className="icon-trash w-4 h-4"></div>
                    </button>
                </div>
            </div>

            {/* ============================================================= */}
            {/* ИНФОРМАЦИЯ О ВЕЩИ */}
            {/* ============================================================= */}
            <div>
                {/* Название вещи (обрезается если слишком длинное) */}
                <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">{item.name}</h3>
                {/* Категория вещи */}
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            </div>
        </div>
    )
}

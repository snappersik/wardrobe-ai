// =============================================================================
// ФИЛЬТР ПО КАТЕГОРИЯМ — КНОПКИ-PILLS (CategoryFilter.jsx)
// =============================================================================
// Простые кнопки-pills по группам одежды (как в OutfitsPage),
// без выпадающих списков. Детальные подкатегории — в фильтрах.
// =============================================================================

import Icon from '../common/Icon'

// Группы категорий с иконками
const CATEGORY_GROUPS = [
    { id: 'Все', label: 'Все', icon: 'grid' },
    { id: 'Верх', label: 'Верх', icon: 'shirt' },
    { id: 'Свитеры и кардиганы', label: 'Свитеры', icon: 'layers' },
    { id: 'Верхняя одежда', label: 'Верхняя', icon: 'jacket' },
    { id: 'Низ', label: 'Низ', icon: 'trousers' },
    { id: 'Платья и комбинезоны', label: 'Платья', icon: 'dress' },
    { id: 'Обувь', label: 'Обувь', icon: 'footprints' },
]

/**
 * Фильтр категорий — горизонтальный ряд pills.
 * 
 * @param {string} activeCategory - Активная группа (или 'Все')
 * @param {function} setActiveCategory - Функция смены группы
 */
export default function CategoryFilter({ activeCategory, setActiveCategory }) {
    return (
        <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
                {CATEGORY_GROUPS.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`pill flex items-center gap-1.5 whitespace-nowrap ${activeCategory === cat.id ? 'pill-active' : 'pill-inactive'
                            }`}
                    >
                        <Icon name={cat.icon} size={15} />
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

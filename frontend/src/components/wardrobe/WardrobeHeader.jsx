// =============================================================================
// ЗАГОЛОВОК ГАРДЕРОБА (WardrobeHeader.jsx) — glass-style search
// =============================================================================

import Icon from '../common/Icon'

export default function WardrobeHeader({ searchQuery, setSearchQuery, sortOption, setSortOption, itemCount, onOpenFilters, hasActiveFilters }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мой гардероб</h1>
                <p className="text-gray-400 text-sm">{itemCount} вещей</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                {/* Поле поиска — glass style */}
                <div className="relative flex-grow md:w-64">
                    <input
                        type="text"
                        placeholder="Поиск вещи..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 shadow-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon name="search" size={16} />
                    </div>
                </div>

                {/* Кнопка фильтров */}
                <button
                    onClick={onOpenFilters}
                    className={`relative p-2.5 backdrop-blur-sm border rounded-xl transition-all duration-200 shadow-sm ${hasActiveFilters
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-white/80 border-gray-200/60 text-gray-500 hover:border-primary/30 hover:text-primary'
                        }`}
                    aria-label="Фильтры"
                >
                    <Icon name="sliders-horizontal" size={20} />
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white animate-pulse-border" />
                    )}
                </button>
            </div>
        </div>
    )
}

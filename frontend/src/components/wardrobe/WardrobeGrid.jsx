// =============================================================================
// СЕТКА ГАРДЕРОБА (WardrobeGrid.jsx) — with shimmer loading
// =============================================================================

import WardrobeCard from './WardrobeCard'
import EmptyState from './EmptyState'

export default function WardrobeGrid({ items, loading, onDelete, onEdit, onAddClick }) {
    // СОСТОЯНИЕ: ЗАГРУЗКА — shimmer skeletons
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100/50">
                        <div className="w-full aspect-[3/4] skeleton mb-3"></div>
                        <div className="h-4 skeleton w-3/4 mb-2"></div>
                        <div className="h-3 skeleton w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    // ПУСТОЙ ГАРДЕРОБ
    if (items.length === 0) {
        return <EmptyState onAddClick={onAddClick} />
    }

    // ЕСТЬ ВЕЩИ — staggered fade-up animation
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20 md:pb-0">
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                >
                    <WardrobeCard item={item} onDelete={onDelete} onEdit={onEdit} />
                </div>
            ))}
        </div>
    )
}

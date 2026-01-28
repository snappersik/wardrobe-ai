import WardrobeCard from './WardrobeCard'
import EmptyState from './EmptyState'

export default function WardrobeGrid({ items, loading, onDelete }) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div key={n} className="bg-white rounded-2xl p-3 h-64 animate-pulse">
                        <div className="w-full h-40 bg-gray-200 rounded-xl mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        )
    }

    if (items.length === 0) {
        return <EmptyState />
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-20 md:pb-0">
            {items.map(item => (
                <WardrobeCard key={item.id} item={item} onDelete={onDelete} />
            ))}
        </div>
    )
}

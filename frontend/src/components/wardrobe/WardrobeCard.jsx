export default function WardrobeCard({ item, onDelete }) {
    return (
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 card-hover group relative">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-50">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-700">
                        <div className="icon-pencil w-4 h-4"></div>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                        className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-red-500"
                    >
                        <div className="icon-trash w-4 h-4"></div>
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-medium text-gray-900 truncate text-sm md:text-base">{item.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            </div>
        </div>
    )
}

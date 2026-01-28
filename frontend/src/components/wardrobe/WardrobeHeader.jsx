export default function WardrobeHeader({ searchQuery, setSearchQuery, sortOption, setSortOption, itemCount }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мой гардероб</h1>
                <p className="text-gray-500 text-sm">Всего вещей: {itemCount}</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-grow md:w-64">
                    <input
                        type="text"
                        placeholder="Поиск вещи..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <div className="icon-search w-4 h-4"></div>
                    </div>
                </div>

                <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors">
                    <div className="icon-sliders-horizontal w-5 h-5"></div>
                </button>
            </div>
        </div>
    )
}

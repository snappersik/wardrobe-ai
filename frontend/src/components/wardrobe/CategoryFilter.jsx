export default function CategoryFilter({ activeCategory, setActiveCategory }) {
    const categories = ['Все', 'Верх', 'Низ', 'Обувь', 'Верхняя одежда', 'Аксессуары', 'Платья']

    return (
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`pill ${activeCategory === cat ? 'pill-active' : 'pill-inactive'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    )
}

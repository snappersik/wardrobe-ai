import { useState, useEffect } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import WardrobeHeader from '../components/wardrobe/WardrobeHeader'
import CategoryFilter from '../components/wardrobe/CategoryFilter'
import WardrobeGrid from '../components/wardrobe/WardrobeGrid'
import FAB from '../components/wardrobe/FAB'

export default function WardrobePage() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('Все')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('newest')

    // Mock User
    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: false
    }

    // Simulate data fetching
    useEffect(() => {
        setTimeout(() => {
            setItems([
                { id: 1, name: 'Бежевый тренч', category: 'Верхняя одежда', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80', date: '2023-10-01' },
                { id: 2, name: 'Белая футболка', category: 'Верх', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80', date: '2023-10-05' },
                { id: 3, name: 'Джинсы Mom', category: 'Низ', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80', date: '2023-09-15' },
                { id: 4, name: 'Кеды Converse', category: 'Обувь', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80', date: '2023-10-10' },
                { id: 5, name: 'Черная сумка', category: 'Аксессуары', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80', date: '2023-08-20' },
                { id: 6, name: 'Шелковый платок', category: 'Аксессуары', image: 'https://images.unsplash.com/photo-1585218356057-1df245b73676?auto=format&fit=crop&w=400&q=80', date: '2023-09-01' },
            ])
            setLoading(false)
        }, 1500)
    }, [])

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'Все' || item.category === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const handleDelete = (id) => {
        if (confirm('Вы уверены, что хотите удалить эту вещь?')) {
            setItems(prev => prev.filter(item => item.id !== id))
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="wardrobe" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <WardrobeHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    itemCount={filteredItems.length}
                />

                <CategoryFilter
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

                <WardrobeGrid
                    items={filteredItems}
                    loading={loading}
                    onDelete={handleDelete}
                />
            </main>

            <FAB />
            <MobileNav activePage="wardrobe" />
        </div>
    )
}

import { useState, useEffect } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import WardrobeHeader from '../components/wardrobe/WardrobeHeader'
import CategoryFilter from '../components/wardrobe/CategoryFilter'
import WardrobeGrid from '../components/wardrobe/WardrobeGrid'
import FAB from '../components/wardrobe/FAB'
import UploadModal from '../components/wardrobe/UploadModal'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function WardrobePage() {
    const { user } = useAuth()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState('Все')
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('newest')

    // Data fetching
    useEffect(() => {
        fetchItems()
    }, [])
    const fetchItems = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/clothing')
            setItems(data)
        } catch (error) {
            console.error('Failed to fetch items', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = items.filter(item => {
        const matchesCategory = activeCategory === 'Все' || item.category === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesCategory && matchesSearch
    }).sort((a, b) => {
        if (sortOption === 'newest') return new Date(b.created_at) - new Date(a.created_at)
        if (sortOption === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
        return 0
    })
    const handleDelete = async (id) => {
        // ... (same)
        if (confirm('Вы уверены, что хотите удалить эту вещь?')) {
            try {
                await api.delete(`/clothing/${id}`)
                setItems(prev => prev.filter(item => item.id !== id))
            } catch (error) {
                console.error('Failed to delete item', error)
                alert('Не удалось удалить вещь')
            }
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
                    onUploadClick={() => setIsUploadModalOpen(true)}
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

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={() => {
                    fetchItems()
                }}
            />
        </div>
    )
}

import { useState, useEffect } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import FAB from '../components/wardrobe/FAB'

import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function OutfitsPage() {
    const { user } = useAuth()
    const [outfits, setOutfits] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeOccasion, setActiveOccasion] = useState('Все')

    const occasions = ['Все', 'Повседневный', 'Офис', 'Вечеринка', 'Спорт', 'Свидание']

    useEffect(() => {
        fetchOutfits()
    }, [])

    const fetchOutfits = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/outfits/my-outfits')
            // Map backend data to UI format
            // Backend: { id, name, target_season, ... } -> UI needs image, items count
            const mappedOutfits = data.map(outfit => ({
                id: outfit.id,
                name: outfit.name || 'Без названия',
                occasion: outfit.target_season || 'Повседневный', // Fallback mapping since backend is limited
                items: outfit.items ? outfit.items.length : '?', // Backend list endpoint doesn't return count yet
                image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=300', // Placeholder for now
                date: new Date(outfit.created_at).toLocaleDateString()
            }))
            setOutfits(mappedOutfits)
        } catch (error) {
            console.error('Failed to fetch outfits', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredOutfits = outfits.filter(outfit =>
        activeOccasion === 'Все' || outfit.occasion === activeOccasion
    )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="outfits" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 hidden md:block">Мои образы</h1>
                        <p className="text-gray-500 text-sm">Всего образов: {filteredOutfits.length}</p>
                    </div>
                </div>

                <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-2">
                        {occasions.map(occasion => (
                            <button
                                key={occasion}
                                onClick={() => setActiveOccasion(occasion)}
                                className={`pill ${activeOccasion === occasion ? 'pill-active' : 'pill-inactive'}`}
                            >
                                {occasion}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="bg-white rounded-2xl p-4 h-80 animate-pulse">
                                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredOutfits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <div className="icon-layers text-gray-300 w-24 h-24"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Нет сохранённых образов</h3>
                        <p className="text-gray-500 max-w-xs mb-8">Создайте свой первый образ с помощью AI генератора</p>
                        <button className="btn btn-primary px-8">Создать образ</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
                        {filteredOutfits.map(outfit => (
                            <div key={outfit.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                                <div className="relative h-48 bg-gray-100">
                                    <img src={outfit.image} alt={outfit.name} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                                        {outfit.occasion}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 mb-1">{outfit.name}</h3>
                                    <p className="text-sm text-gray-500">{outfit.items} вещей</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <FAB />
            <MobileNav activePage="outfits" />
        </div>
    )
}

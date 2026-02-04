import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import Toast from '../components/common/Toast'
import Icon from '../components/common/Icon'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function OutfitDetailPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { outfitId } = useParams()

    const [outfit, setOutfit] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)

    const [showAddModal, setShowAddModal] = useState(false)
    const [wardrobeItems, setWardrobeItems] = useState([])
    const [selectedToAdd, setSelectedToAdd] = useState([])

    const [formData, setFormData] = useState({
        name: '',
        occasion: 'Повседневный'
    })

    const occasions = ['Повседневный', 'Офис', 'Вечеринка', 'Спорт', 'Свидание']
    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 2500)
    }

    const fetchOutfit = async () => {
        try {
            setLoading(true)
            const { data } = await api.get(`/outfits/${outfitId}`)
            setOutfit(data)
            setFormData({
                name: data.name || '',
                occasion: data.target_season || 'Повседневный'
            })
        } catch (error) {
            console.error('Failed to fetch outfit', error)
            showToast('Не удалось загрузить образ', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchWardrobeItems = async () => {
        try {
            const { data } = await api.get('/clothing')
            setWardrobeItems(data)
        } catch (error) {
            console.error('Failed to fetch wardrobe items', error)
        }
    }

    useEffect(() => {
        fetchOutfit()
    }, [outfitId])

    useEffect(() => {
        if (showAddModal) {
            fetchWardrobeItems()
        }
    }, [showAddModal])

    const handleSaveMeta = async () => {
        try {
            setSaving(true)
            await api.patch(`/outfits/${outfitId}`, {
                name: formData.name,
                target_season: formData.occasion
            })
            showToast('Образ обновлён')
        } catch (error) {
            console.error('Failed to update outfit', error)
            showToast('Не удалось сохранить', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            await api.delete(`/outfits/${outfitId}/remove-item/${itemId}`)
            setOutfit(prev => ({
                ...prev,
                items: prev.items.filter(i => i.id !== itemId)
            }))
        } catch (error) {
            console.error('Failed to remove item', error)
            showToast('Не удалось удалить вещь', 'error')
        }
    }

    const toggleSelectToAdd = (item) => {
        setSelectedToAdd(prev => (
            prev.some(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        ))
    }

    const handleAddItems = async () => {
        if (selectedToAdd.length === 0) return
        try {
            await api.post(`/outfits/${outfitId}/add-items`, {
                item_ids: selectedToAdd.map(i => i.id)
            })
            setShowAddModal(false)
            setSelectedToAdd([])
            fetchOutfit()
        } catch (error) {
            console.error('Failed to add items', error)
            showToast('Не удалось добавить вещи', 'error')
        }
    }

    const itemsCount = useMemo(() => outfit?.items?.length || 0, [outfit])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="outfits" user={user} />

            <main className="flex-grow container mx-auto max-w-6xl px-4 md:px-6 py-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Icon name="arrow-left" size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Детали образа</h1>
                        <p className="text-gray-500 text-sm">Всего вещей: {itemsCount}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="h-6 w-1/3 bg-gray-200 rounded mb-3 animate-pulse" />
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                ) : !outfit ? (
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-gray-500">
                        Образ не найден
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Вещи в образе</h2>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover transition-colors"
                                >
                                    <Icon name="plus" size={16} />
                                    Добавить
                                </button>
                            </div>

                            {outfit.items?.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Icon name="inbox" size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>В образе пока нет вещей</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {outfit.items.map(item => (
                                        <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                            <img
                                                src={`${mediaBaseUrl}/${item.image_path}`}
                                                alt={item.filename}
                                                className="w-full h-full object-contain"
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="absolute top-1 right-1 w-7 h-7 bg-white/90 text-red-500 rounded-full flex items-center justify-center hover:bg-white"
                                                aria-label="Удалить вещь"
                                            >
                                                <Icon name="trash" size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 h-fit">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Параметры</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Название образа"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                                <select
                                    value={formData.occasion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                                >
                                    {occasions.map(o => (
                                        <option key={o} value={o}>{o}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSaveMeta}
                                disabled={saving}
                                className="w-full btn btn-primary py-3 font-bold disabled:opacity-50"
                            >
                                {saving ? 'Сохраняем...' : 'Сохранить изменения'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <MobileNav activePage="outfits" />

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Добавить вещи</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto">
                            {wardrobeItems.map(item => {
                                const isSelected = selectedToAdd.some(i => i.id === item.id)
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleSelectToAdd(item)}
                                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${isSelected
                                            ? 'border-primary ring-2 ring-primary/20 scale-95'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                            alt={item.filename}
                                            className="w-full h-full object-cover"
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center">
                                                    <Icon name="check" size={16} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-5">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleAddItems}
                                disabled={selectedToAdd.length === 0}
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
                            >
                                Добавить {selectedToAdd.length > 0 ? `(${selectedToAdd.length})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

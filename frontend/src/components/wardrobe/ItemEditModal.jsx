// =============================================================================
// МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ВЕЩИ (ItemEditModal.jsx)
// =============================================================================
// Отображается после загрузки фото для редактирования параметров вещи:
// категория, цвет, сезон, стиль.
// =============================================================================

import { useState } from 'react'
import Icon from '../common/Icon'
import api from '../../api/axios'

// Категории одежды
import clothingCategories from '../../data/clothing-categories.json'

// Доступные цвета
const COLORS = [
    { id: 'black', name: 'Чёрный', hex: '#000000' },
    { id: 'white', name: 'Белый', hex: '#FFFFFF' },
    { id: 'gray', name: 'Серый', hex: '#9CA3AF' },
    { id: 'red', name: 'Красный', hex: '#EF4444' },
    { id: 'orange', name: 'Оранжевый', hex: '#F97316' },
    { id: 'yellow', name: 'Жёлтый', hex: '#EAB308' },
    { id: 'green', name: 'Зелёный', hex: '#22C55E' },
    { id: 'blue', name: 'Синий', hex: '#3B82F6' },
    { id: 'purple', name: 'Фиолетовый', hex: '#A855F7' },
    { id: 'pink', name: 'Розовый', hex: '#EC4899' },
    { id: 'brown', name: 'Коричневый', hex: '#92400E' },
    { id: 'beige', name: 'Бежевый', hex: '#D4B896' }
]

// Сезоны
const SEASONS = [
    { id: 'winter', name: 'Зима', icon: '❄️' },
    { id: 'spring', name: 'Весна', icon: '🌸' },
    { id: 'summer', name: 'Лето', icon: '☀️' },
    { id: 'autumn', name: 'Осень', icon: '🍂' },
    { id: 'all', name: 'Всесезонная', icon: '📅' }
]

// Стили
const STYLES = [
    { id: 'casual', name: 'Повседневный' },
    { id: 'formal', name: 'Деловой' },
    { id: 'sport', name: 'Спортивный' },
    { id: 'party', name: 'Вечерний' },
    { id: 'street', name: 'Уличный' }
]

/**
 * Модальное окно редактирования параметров вещи.
 * 
 * @param {boolean} isOpen - Открыто ли окно
 * @param {Object} item - Данные загруженной вещи
 * @param {function} onSave - Callback после сохранения
 * @param {function} onClose - Callback закрытия
 */
export default function ItemEditModal({ isOpen, item, onSave, onClose }) {
    const [saving, setSaving] = useState(false)

    // Форма редактирования
    const [formData, setFormData] = useState({
        name: item?.filename?.replace(/\.[^/.]+$/, '') || 'Новая вещь',
        category: item?.category || 'unknown',
        color: item?.color || 'black',
        season: item?.season || 'all',
        style: item?.style || 'casual'
    })

    if (!isOpen || !item) return null

    // URL изображения
    const imageUrl = item.image_path
        ? `${api.defaults.baseURL.replace('/api', '')}/${item.image_path}`
        : 'https://via.placeholder.com/300x400?text=No+Image'

    const handleSave = async () => {
        setSaving(true)
        try {
            // Обновляем вещь на сервере
            await api.put(`/clothing/${item.id}`, formData)
            onSave?.()
        } catch (error) {
            console.error('Failed to update item', error)
            alert('Не удалось сохранить изменения')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
                {/* Заголовок */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Проверьте данные</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <Icon name="x" size={24} />
                    </button>
                </div>

                {/* Превью изображения */}
                <div className="relative w-full aspect-square max-h-64 rounded-xl overflow-hidden mb-6 bg-gray-50 flex items-center justify-center">
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image' }}
                    />
                    <div className="absolute top-2 left-2 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                        ✓ Фон удалён
                    </div>
                </div>

                {/* Форма */}
                <div className="space-y-4">
                    {/* Название */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            placeholder="Например: Белая футболка"
                        />
                    </div>

                    {/* Категория */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Категория
                            <span className="text-xs text-gray-400 ml-2">(определено ИИ)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {clothingCategories.filter(c => c.id !== 'unknown').map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.category === cat.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Цвет */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(color => (
                                <button
                                    key={color.id}
                                    onClick={() => setFormData({ ...formData, color: color.id })}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.id
                                            ? 'border-primary scale-110 ring-2 ring-primary/30'
                                            : 'border-gray-200 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Сезон */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Сезон</label>
                        <div className="flex flex-wrap gap-2">
                            {SEASONS.map(season => (
                                <button
                                    key={season.id}
                                    onClick={() => setFormData({ ...formData, season: season.id })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.season === season.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {season.icon} {season.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Стиль */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Стиль</label>
                        <div className="flex flex-wrap gap-2">
                            {STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setFormData({ ...formData, style: style.id })}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${formData.style === style.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Кнопка сохранения */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-6 btn btn-primary py-3 font-bold disabled:opacity-50"
                >
                    {saving ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Сохраняем...</span>
                        </div>
                    ) : (
                        <>
                            <Icon name="save" size={18} className="inline mr-2" />
                            Сохранить в гардероб
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

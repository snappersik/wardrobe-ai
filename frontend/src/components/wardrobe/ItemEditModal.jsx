// =============================================================================
// МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ВЕЩИ (ItemEditModal.jsx) — Phase 2
// =============================================================================
// Поддерживает 46 категорий (группированных), умный выбор цвета (5 вариантов ИИ),
// температурный слайдер, индикатор влагозащиты, палитру цветов.
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import Icon from '../common/Icon'
import api from '../../api/axios'
import clothingCategories from '../../data/clothing-categories.json'

// Доступные цвета (запасной вариант)
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
    { id: 'fall', name: 'Осень', icon: '🍂' }
]

// Стили
const STYLES = [
    { id: 'casual', name: 'Повседневный' },
    { id: 'formal', name: 'Деловой' },
    { id: 'sport', name: 'Спортивный' },
    { id: 'party', name: 'Вечерний' },
    { id: 'street', name: 'Уличный' },
    { id: 'ethnic', name: 'Этнический' },
    { id: 'vintage', name: 'Винтаж' }
]

// Группировка категорий из JSON
function buildCategoryGroups() {
    const groups = {}
    for (const cat of clothingCategories) {
        const g = cat.group || 'Другое'
        if (!groups[g]) groups[g] = []
        groups[g].push(cat)
    }
    return Object.entries(groups).map(([group, cats]) => ({ group, categories: cats }))
}
const CATEGORY_GROUPS = buildCategoryGroups()


// Водная капля — визуальный индикатор влагозащиты (0-4)
function WaterDroplets({ level, onChange }) {
    return (
        <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i)}
                    className={`text-lg transition-all ${i <= level ? 'opacity-100 scale-110' : 'opacity-25 grayscale'}`}
                    title={['Нет защиты', 'Минимальная', 'Средняя', 'Хорошая', 'Полная'][i]}
                >
                    💧
                </button>
            ))}
            <span className="ml-2 text-xs text-gray-400">
                {['Нет', 'Мин.', 'Средняя', 'Хорошая', 'Полная'][level]}
            </span>
        </div>
    )
}

// Слайдер для температурного диапазона
function TempRangeSlider({ min, max, onChange }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>-25°C</span>
                <span className="font-semibold text-sm text-gray-800">{min}°C — {max}°C</span>
                <span>+40°C</span>
            </div>
            <div className="flex gap-3 items-center">
                <input
                    type="range"
                    min={-25}
                    max={40}
                    value={min}
                    onChange={(e) => onChange(Math.min(+e.target.value, max - 1), max)}
                    className="flex-1 accent-blue-500 h-2"
                />
                <input
                    type="range"
                    min={-25}
                    max={40}
                    value={max}
                    onChange={(e) => onChange(min, Math.max(+e.target.value, min + 1))}
                    className="flex-1 accent-red-400 h-2"
                />
            </div>
            <div className="flex gap-1 text-xs text-gray-400">
                <span>❄️ Мин</span>
                <span className="ml-auto">☀️ Макс</span>
            </div>
        </div>
    )
}


export default function ItemEditModal({ isOpen, item, onSave, onClose }) {
    const [saving, setSaving] = useState(false)
    const [expandedGroup, setExpandedGroup] = useState(null)
    const [showAllColors, setShowAllColors] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        category: 'tee',
        color: ['black'],
        season: ['spring', 'summer', 'fall'],
        style: ['casual'],
        temp_min: 15,
        temp_max: 35,
        waterproof_level: 0,
        is_multicolor: false,
        color_palette: [],
        is_favorite: false,
    })

    // Рекомендации ИИ по цвету
    const [colorSuggestions, setColorSuggestions] = useState([])

    // Инициализация формы при изменении item
    useEffect(() => {
        if (item) {
            const colors = Array.isArray(item.color) ? item.color : (item.color ? [item.color] : ['black'])
            const category = item.category || 'tee'
            const seasons = Array.isArray(item.seasons) ? item.seasons
                : Array.isArray(item.season) ? item.season
                    : (item.season ? [item.season] : ['spring', 'summer', 'fall'])

            const catObj = clothingCategories.find(c => c.id === category)

            setFormData({
                name: item.name || catObj?.name || 'Вещь',
                category: category,
                color: colors,
                season: seasons,
                style: Array.isArray(item.style) ? item.style : (item.style ? [item.style] : ['casual']),
                temp_min: item.temp_min ?? 15,
                temp_max: item.temp_max ?? 35,
                waterproof_level: item.waterproof_level ?? 0,
                is_multicolor: item.is_multicolor ?? false,
                color_palette: item.color_palette ?? [],
                is_favorite: item.is_favorite ?? false,
            })

            // Установить рекомендации ИИ если есть
            if (item.color_suggestions && item.color_suggestions.length > 0) {
                setColorSuggestions(item.color_suggestions)
                setShowAllColors(false)
            } else {
                setColorSuggestions([])
                setShowAllColors(true)
            }

            // Авто-раскрыть группу текущей категории
            if (catObj) setExpandedGroup(catObj.group)
        }
    }, [item])

    // ESC + блокировка скролла
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose?.()
    }, [onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, handleKeyDown])

    // Toggle helpers
    const toggleArray = (field, id) => {
        setFormData(prev => {
            const arr = prev[field] || []
            if (arr.includes(id)) {
                const next = arr.filter(x => x !== id)
                return { ...prev, [field]: next.length > 0 ? next : arr }
            }
            return { ...prev, [field]: [...arr, id] }
        })
    }

    // Выбор рекомендованного цвета ИИ
    const selectSuggestedColor = (suggestion) => {
        setFormData(prev => {
            const colorId = suggestion.id || suggestion.name_en
            const exists = prev.color.includes(colorId)
            return {
                ...prev,
                color: exists ? prev.color : [colorId]
            }
        })
    }

    if (!isOpen || !item) return null

    const imageUrl = item.image_path
        ? `${api.defaults.baseURL.replace('/api', '')}/${item.image_path}`
        : 'https://via.placeholder.com/300x400?text=No+Image'

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                color: formData.color,
                season: formData.season,
                style: formData.style,
                temp_min: formData.temp_min,
                temp_max: formData.temp_max,
                waterproof_level: formData.waterproof_level,
                is_multicolor: formData.is_multicolor,
                color_palette: formData.color_palette,
                is_favorite: formData.is_favorite,
            }

            if (item.pending) {
                await api.post('/clothing/confirm', {
                    ...payload,
                    file_id: item.file_id,
                    image_path: item.image_path,
                    filename: item.filename,
                })
            } else {
                await api.put(`/clothing/${item.id}`, payload)
            }
            onSave?.()
        } catch (error) {
            console.error('Failed to save item', error)
            alert('Не удалось сохранить изменения')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl my-8 animate-scale-in">
                {/* Заголовок */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Проверьте данные</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" title="Закрыть (Esc)">
                        <Icon name="x" size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Изображение */}
                    <div className="md:col-span-1">
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center sticky top-0">
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
                        {/* Палитра под изображением */}
                        {formData.color_palette?.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-gray-400 mb-1">Палитра</p>
                                <div className="flex gap-1">
                                    {formData.color_palette.map((hex, i) => (
                                        <div
                                            key={i}
                                            className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm"
                                            style={{ backgroundColor: hex }}
                                            title={hex}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Форма */}
                    <div className="md:col-span-2 space-y-4">
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

                        {/* ============ КАТЕГОРИЯ (группированная) ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Категория
                                <span className="text-xs text-gray-400 ml-2">(определено ИИ)</span>
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                                {CATEGORY_GROUPS.map(({ group, categories }) => (
                                    <div key={group}>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedGroup(expandedGroup === group ? null : group)}
                                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${categories.some(c => c.id === formData.category)
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>{group}</span>
                                            <Icon name={expandedGroup === group ? 'chevron-up' : 'chevron-down'} size={14} />
                                        </button>
                                        {expandedGroup === group && (
                                            <div className="flex flex-wrap gap-1.5 mt-1.5 ml-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${formData.category === cat.id
                                                                ? 'bg-primary text-white shadow-sm'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ============ ЦВЕТ — ИИ-РЕКОМЕНДАЦИИ ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🎨 Цвет
                                {colorSuggestions.length > 0 && (
                                    <span className="text-xs text-primary ml-2">— рекомендации ИИ</span>
                                )}
                            </label>

                            {/* Рекомендации ИИ (5 больших кружков) */}
                            {colorSuggestions.length > 0 && !showAllColors && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-2">Выберите самый близкий к реальному цвету:</p>
                                    <div className="flex flex-wrap gap-3">
                                        {colorSuggestions.map((s, i) => {
                                            const isSelected = formData.color.includes(s.id || s.name_en)
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => selectSuggestedColor(s)}
                                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isSelected
                                                            ? 'bg-primary/10 ring-2 ring-primary scale-105'
                                                            : 'hover:bg-gray-50 hover:scale-105'
                                                        }`}
                                                    title={`${s.name_ru} (${s.label})`}
                                                >
                                                    <div
                                                        className={`w-12 h-12 rounded-xl border-2 shadow-sm ${isSelected ? 'border-primary' : 'border-gray-200'
                                                            }`}
                                                        style={{ backgroundColor: s.hex }}
                                                    />
                                                    <span className="text-[10px] text-gray-500">{s.label}</span>
                                                    <span className="text-[10px] font-medium text-gray-700">{s.name_ru}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAllColors(true)}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Показать все цвета →
                                    </button>
                                </div>
                            )}

                            {/* Стандартная палитра (12 кружков) */}
                            {(showAllColors || colorSuggestions.length === 0) && (
                                <div>
                                    {colorSuggestions.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowAllColors(false)}
                                            className="mb-2 text-xs text-primary hover:underline"
                                        >
                                            ← Вернуться к рекомендациям ИИ
                                        </button>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {COLORS.map(color => (
                                            <button
                                                key={color.id}
                                                onClick={() => toggleArray('color', color.id)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${(formData.color || []).includes(color.id)
                                                        ? 'border-primary scale-110 ring-2 ring-primary/30'
                                                        : 'border-gray-200 hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============ СЕЗОН (мульти-выбор) ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Сезон</label>
                            <div className="flex flex-wrap gap-2">
                                {SEASONS.map(season => (
                                    <button
                                        key={season.id}
                                        onClick={() => toggleArray('season', season.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(formData.season || []).includes(season.id)
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {season.icon} {season.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ============ СТИЛЬ (мульти-выбор) ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Стиль</label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => toggleArray('style', style.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(formData.style || []).includes(style.id)
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {style.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ============ ТЕМПЕРАТУРНЫЙ ДИАПАЗОН ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🌡️ Температурный режим
                            </label>
                            <TempRangeSlider
                                min={formData.temp_min}
                                max={formData.temp_max}
                                onChange={(min, max) => setFormData(prev => ({ ...prev, temp_min: min, temp_max: max }))}
                            />
                        </div>

                        {/* ============ ВЛАГОЗАЩИТА ============ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                💧 Влагозащита
                            </label>
                            <WaterDroplets
                                level={formData.waterproof_level}
                                onChange={(lvl) => setFormData(prev => ({ ...prev, waterproof_level: lvl }))}
                            />
                        </div>

                        {/* ============ КНОПКА СОХРАНЕНИЯ ============ */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full mt-4 btn btn-primary py-3 font-bold disabled:opacity-50"
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
            </div>
        </div>
    )
}

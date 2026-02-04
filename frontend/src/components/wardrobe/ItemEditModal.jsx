// =============================================================================
// МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ВЕЩИ (ItemEditModal.jsx)
// =============================================================================
// Отображается после загрузки фото для редактирования параметров вещи:
// категория, цвет, сезон, стиль.
// =============================================================================

import { useState, useEffect, useCallback } from 'react'
import Icon from '../common/Icon'
import api from '../../api/axios'

// Категории одежды
import clothingCategories from '../../data/clothing-categories.json'

// Доступные цвета с русскими прилагательными для названий
const COLORS = [
    { id: 'black', name: 'Чёрный', hex: '#000000', adjective: 'черн' },
    { id: 'white', name: 'Белый', hex: '#FFFFFF', adjective: 'бел' },
    { id: 'gray', name: 'Серый', hex: '#9CA3AF', adjective: 'сер' },
    { id: 'red', name: 'Красный', hex: '#EF4444', adjective: 'красн' },
    { id: 'orange', name: 'Оранжевый', hex: '#F97316', adjective: 'оранжев' },
    { id: 'yellow', name: 'Жёлтый', hex: '#EAB308', adjective: 'желт' },
    { id: 'green', name: 'Зелёный', hex: '#22C55E', adjective: 'зелен' },
    { id: 'blue', name: 'Синий', hex: '#3B82F6', adjective: 'син' },
    { id: 'purple', name: 'Фиолетовый', hex: '#A855F7', adjective: 'фиолетов' },
    { id: 'pink', name: 'Розовый', hex: '#EC4899', adjective: 'розов' },
    { id: 'brown', name: 'Коричневый', hex: '#92400E', adjective: 'коричнев' },
    { id: 'beige', name: 'Бежевый', hex: '#D4B896', adjective: 'бежев' }
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

// Окончания прилагательных в зависимости от рода категории
const CATEGORY_GENDER = {
    't-shirt': 'f',    // футболка - ж.р.
    'trouser': 'm',    // брюки - мн.ч.
    'pullover': 'm',   // пуловер - м.р.
    'dress': 'n',      // платье - ср.р.
    'coat': 'n',       // пальто - ср.р.
    'sandal': 'f',     // сандалии - мн.ч. (женские окончания)
    'shirt': 'f',      // рубашка - ж.р.
    'sneaker': 'm',    // кроссовки - мн.ч.
    'bag': 'f',        // сумка - ж.р.
    'ankle-boot': 'm', // ботинки - мн.ч.
    'unknown': 'm'     // по умолчанию м.р.
}

// Генерация склонённого прилагательного цвета
function getColorAdjective(colorId, gender) {
    const color = COLORS.find(c => c.id === colorId)
    if (!color) return ''

    const base = color.adjective
    const endings = {
        'm': 'ый',  // мужской род / мн.ч.
        'f': 'ая',  // женский род
        'n': 'ое'   // средний род
    }

    // Особые случаи
    if (colorId === 'blue') {
        return gender === 'f' ? 'синяя' : gender === 'n' ? 'синее' : 'синий'
    }

    return base + (endings[gender] || 'ый')
}

// Генерация названия вещи на основе категории и цветов
function generateItemName(categoryId, colorIds) {
    const category = clothingCategories.find(c => c.id === categoryId)
    const categoryName = category?.name || 'Вещь'
    const gender = CATEGORY_GENDER[categoryId] || 'm'

    if (!colorIds || colorIds.length === 0) {
        return categoryName
    }

    if (colorIds.length > 2) {
        // Больше 2 цветов = разноцветная
        const multiEndings = { m: 'ый', f: 'ая', n: 'ое' }
        return `${categoryName} разноцветн${multiEndings[gender] || 'ый'}`
    }

    if (colorIds.length === 2) {
        // 2 цвета = бело-розовая, черно-белая и т.д.
        const color1 = COLORS.find(c => c.id === colorIds[0])
        const color2Adj = getColorAdjective(colorIds[1], gender)
        // Первый цвет с "о" на конце
        const color1Base = color1?.adjective || ''
        return `${categoryName} ${color1Base}о-${color2Adj}`
    }

    // 1 цвет
    const colorAdj = getColorAdjective(colorIds[0], gender)
    return `${categoryName} ${colorAdj}`
}

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
    // color, season, style - всё массивы для мульти-выбора
    const [formData, setFormData] = useState({
        name: '',
        category: item?.category || 'unknown',
        color: Array.isArray(item?.color) ? item.color : (item?.color ? [item.color] : ['black']),
        season: Array.isArray(item?.season) ? item.season : (item?.season ? [item.season] : ['all']),
        style: Array.isArray(item?.style) ? item.style : (item?.style ? [item.style] : ['casual'])
    })

    // Обновляем форму при изменении item
    useEffect(() => {
        if (item) {
            const colors = Array.isArray(item.color) ? item.color : (item.color ? [item.color] : ['black'])
            const category = item.category || 'unknown'

            setFormData({
                name: generateItemName(category, colors),
                category: category,
                color: colors,
                season: Array.isArray(item.season) ? item.season : (item.season ? [item.season] : ['all']),
                style: Array.isArray(item.style) ? item.style : (item.style ? [item.style] : ['casual'])
            })
        }
    }, [item])

    // Обновляем название при изменении категории или цветов
    useEffect(() => {
        const newName = generateItemName(formData.category, formData.color)
        setFormData(prev => ({ ...prev, name: newName }))
    }, [formData.category, formData.color])

    // Обработчик ESC для закрытия
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose?.()
        }
    }, [onClose])

    // Подписка на ESC и блокировка прокрутки body
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

    // Toggle цвета (добавить/убрать)
    const toggleColor = (colorId) => {
        setFormData(prev => {
            const current = prev.color || []
            if (current.includes(colorId)) {
                const newColors = current.filter(c => c !== colorId)
                return { ...prev, color: newColors.length > 0 ? newColors : current }
            } else {
                return { ...prev, color: [...current, colorId] }
            }
        })
    }

    // Toggle сезона (добавить/убрать)
    const toggleSeason = (seasonId) => {
        setFormData(prev => {
            const current = prev.season || []
            if (current.includes(seasonId)) {
                const newSeasons = current.filter(s => s !== seasonId)
                return { ...prev, season: newSeasons.length > 0 ? newSeasons : current }
            } else {
                return { ...prev, season: [...current, seasonId] }
            }
        })
    }

    // Toggle стиля (добавить/убрать)
    const toggleStyle = (styleId) => {
        setFormData(prev => {
            const currentStyles = prev.style || []
            if (currentStyles.includes(styleId)) {
                // Убираем стиль, но не позволяем пустой массив
                const newStyles = currentStyles.filter(s => s !== styleId)
                return { ...prev, style: newStyles.length > 0 ? newStyles : currentStyles }
            } else {
                // Добавляем стиль
                return { ...prev, style: [...currentStyles, styleId] }
            }
        })
    }

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
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl my-8">
                {/* Заголовок */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Проверьте данные</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Закрыть (Esc)"
                    >
                        <Icon name="x" size={24} />
                    </button>
                </div>

                {/* Контент - адаптивный грид */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Левая колонка - изображение */}
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
                    </div>

                    {/* Правая колонка - форма */}
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

                        {/* Цвет (мульти-выбор) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цвет <span className="text-xs text-gray-400">(можно выбрать несколько)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => toggleColor(color.id)}
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

                        {/* Сезон (мульти-выбор) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Сезон <span className="text-xs text-gray-400">(можно выбрать несколько)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {SEASONS.map(season => (
                                    <button
                                        key={season.id}
                                        onClick={() => toggleSeason(season.id)}
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

                        {/* Стиль (мульти-выбор) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Стиль <span className="text-xs text-gray-400">(можно выбрать несколько)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => toggleStyle(style.id)}
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

                        {/* Кнопка сохранения */}
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

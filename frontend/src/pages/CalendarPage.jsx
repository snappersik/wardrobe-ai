// Страница календаря - планирование образов на каждый день
import { useEffect, useMemo, useState } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import Toast from '../components/common/Toast'
import Icon from '../components/common/Icon'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CalendarPage() {
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [showPicker, setShowPicker] = useState(false)
    const [outfits, setOutfits] = useState([])
    const [loadingOutfits, setLoadingOutfits] = useState(false)
    const [calendarMap, setCalendarMap] = useState({})
    const [selectedOutfitIds, setSelectedOutfitIds] = useState([])
    const [toast, setToast] = useState(null)

    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

    const occasionIconMap = {
        'повседневный': 'sun',
        'casual': 'sun',
        'офис': 'briefcase',
        'work': 'briefcase',
        'вечеринка': 'music',
        'party': 'music',
        'свидание': 'heart',
        'date': 'heart',
        'спорт': 'activity',
        'sport': 'activity'
    }

    const normalizeOccasion = (value, name) => {
        if (value) {
            const key = String(value).toLowerCase()
            if (occasionIconMap[key]) {
                return key === 'casual' ? 'Повседневный' :
                    key === 'work' ? 'Офис' :
                        key === 'party' ? 'Вечеринка' :
                            key === 'date' ? 'Свидание' :
                                key === 'sport' ? 'Спорт' : value
            }
            return value
        }
        if (name) {
            const lower = String(name).toLowerCase()
            if (lower.startsWith('ai:')) {
                const raw = lower.replace('ai:', '').trim()
                return raw === 'casual' ? 'Повседневный' :
                    raw === 'work' ? 'Офис' :
                        raw === 'party' ? 'Вечеринка' :
                            raw === 'date' ? 'Свидание' :
                                raw === 'sport' ? 'Спорт' : raw
            }
        }
        return 'Повседневный'
    }

    const getOccasionIcon = (occasion) => {
        const key = String(occasion || '').toLowerCase()
        return occasionIconMap[key] || 'sparkles'
    }

    // Получить дни месяца для отображения в сетке
    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startWeekDay = (firstDay.getDay() + 6) % 7

        const days = []
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null)
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        return days
    }

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 2500)
    }

    const formatDateKey = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    const getMonthRange = (date) => {
        const start = new Date(date.getFullYear(), date.getMonth(), 1)
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        return { start, end }
    }

    const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const isFutureDate = (date) => normalizeDate(date) > normalizeDate(new Date())

    const fetchCalendar = async (targetDate) => {
        try {
            const { start, end } = getMonthRange(targetDate)
            const { data } = await api.get('/calendar', {
                params: {
                    start: formatDateKey(start),
                    end: formatDateKey(end)
                }
            })
            setCalendarMap(data?.calendar || {})
        } catch (error) {
            console.error('Failed to fetch calendar', error)
            showToast('Не удалось загрузить календарь', 'error')
        }
    }

    const fetchOutfits = async () => {
        try {
            setLoadingOutfits(true)
            const { data } = await api.get('/outfits/my-outfits')
            const detailed = await Promise.all(data.map(async (outfit) => {
                try {
                    const detail = await api.get(`/outfits/${outfit.id}`)
                    return detail.data
                } catch (error) {
                    return outfit
                }
            }))
            const mapped = detailed.map(outfit => ({
                id: outfit.id,
                name: outfit.name || 'Без названия',
                occasion: normalizeOccasion(outfit.target_season, outfit.name),
                itemsCount: Array.isArray(outfit.items) ? outfit.items.length : 0,
                previewItems: Array.isArray(outfit.items) ? outfit.items.slice(0, 4) : []
            }))
            setOutfits(mapped)
        } catch (error) {
            console.error('Failed to fetch outfits', error)
            showToast('Не удалось загрузить образы', 'error')
        } finally {
            setLoadingOutfits(false)
        }
    }

    useEffect(() => {
        fetchOutfits()
    }, [])

    useEffect(() => {
        fetchCalendar(currentDate)
    }, [currentDate])

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

    const days = getDaysInMonth(currentDate)
    const today = new Date().getDate()
    const isCurrentMonth = currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()

    const outfitById = useMemo(() => {
        const map = {}
        outfits.forEach(o => { map[o.id] = o })
        return map
    }, [outfits])

    const selectedKey = selectedDate ? formatDateKey(selectedDate) : null
    const selectedOutfits = selectedKey ? (calendarMap[selectedKey] || []) : []

    const openDay = (day) => {
        if (!day) return
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        if (isFutureDate(date)) {
            showToast('Нельзя планировать будущие даты', 'error')
            return
        }
        setSelectedDate(date)
    }

    const openPicker = () => {
        if (!selectedDate) return
        setSelectedOutfitIds(selectedOutfits)
        setShowPicker(true)
    }

    const toggleSelectOutfit = (id) => {
        setSelectedOutfitIds(prev => (
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        ))
    }

    const updateDayOutfits = async (dayDate, outfitIds) => {
        const key = formatDateKey(dayDate)
        try {
            await api.put(`/calendar/${key}`, {
                outfit_ids: outfitIds
            })
            setCalendarMap(prev => ({
                ...prev,
                [key]: outfitIds
            }))
        } catch (error) {
            console.error('Failed to save calendar day', error)
            showToast('Не удалось сохранить день', 'error')
        }
    }

    const saveSelectedOutfits = async () => {
        if (!selectedDate) return
        await updateDayOutfits(selectedDate, selectedOutfitIds)
        setShowPicker(false)
    }

    const removeOutfitFromDay = async (id) => {
        if (!selectedDate) return
        const key = formatDateKey(selectedDate)
        const updated = (calendarMap[key] || []).filter(x => x !== id)
        await updateDayOutfits(selectedDate, updated)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="calendar" user={user} />

            <main className="flex-grow container mx-auto max-w-5xl px-4 md:px-6 py-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Icon name="chevron-left" size={20} className="text-gray-600" />
                        </button>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Icon name="chevron-right" size={20} className="text-gray-600" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, idx) => (
                            (() => {
                                if (day === null) {
                                    return <div key={idx} />
                                }

                                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                                const key = formatDateKey(dateObj)
                                const dayOutfits = calendarMap[key] || []
                                const isSelected = selectedDate && normalizeDate(selectedDate).getTime() === normalizeDate(dateObj).getTime()
                                const isToday = day === today && isCurrentMonth
                                const isFuture = isFutureDate(dateObj)

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => openDay(day)}
                                        disabled={isFuture}
                                        className={`aspect-square p-1 rounded-lg transition-all ${isFuture ? 'bg-gray-50 text-gray-300 cursor-not-allowed' :
                                            isSelected ? 'bg-primary/10 ring-2 ring-primary/30' :
                                                isToday ? 'bg-primary text-white' :
                                                    dayOutfits.length > 0 ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="h-full flex flex-col items-center justify-center gap-1">
                                            <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
                                            {dayOutfits.length > 0 && (
                                                <div className="flex -space-x-1">
                                                    {dayOutfits.slice(0, 3).map((id, i) => {
                                                        const outfit = outfitById[id]
                                                        return (
                                                            <div
                                                                key={`${id}-${i}`}
                                                                className="w-5 h-5 rounded-full bg-white/90 border border-white shadow flex items-center justify-center"
                                                                title={outfit?.occasion || 'Образ'}
                                                            >
                                                                <Icon name={getOccasionIcon(outfit?.occasion)} size={12} className="text-pink-500" />
                                                            </div>
                                                        )
                                                    })}
                                                    {dayOutfits.length > 3 && (
                                                        <div className="w-5 h-5 rounded-full bg-white border border-white flex items-center justify-center text-[10px] text-gray-500 shadow">
                                                            +{dayOutfits.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })()
                        ))}
                    </div>
                </div>

                {/* Детали выбранного дня */}
                {selectedDate && (
                    <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">
                                Образы на {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                            </h3>
                            <button
                                onClick={openPicker}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-hover"
                            >
                                <Icon name="plus" size={16} />
                                Добавить образ
                            </button>
                        </div>

                        {selectedOutfits.length === 0 ? (
                            <div className="text-gray-500 text-sm">Пока нет запланированных образов</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedOutfits.map((id) => {
                                    const outfit = outfitById[id]
                                    if (!outfit) return null
                                    return (
                                        <div key={id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                                            <div className="grid grid-cols-2 gap-2 w-24 h-24">
                                                {outfit.previewItems.slice(0, 4).map((item, idx) => (
                                                    <div key={idx} className="rounded-lg overflow-hidden bg-white">
                                                        <img
                                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                                            alt={item.filename}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{outfit.name}</p>
                                                        <p className="text-xs text-gray-500">{outfit.itemsCount} вещей</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeOutfitFromDay(id)}
                                                        className="text-gray-400 hover:text-red-500"
                                                        aria-label="Удалить образ"
                                                    >
                                                        <Icon name="x" size={16} />
                                                    </button>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Icon name={getOccasionIcon(outfit.occasion)} size={12} className="text-pink-500" />
                                                        {outfit.occasion}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <MobileNav activePage="calendar" />

            {showPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Выберите образы</h3>
                            <button onClick={() => setShowPicker(false)} className="text-gray-500 hover:text-gray-700">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        {loadingOutfits ? (
                            <div className="text-gray-500 text-sm">Загружаем образы...</div>
                        ) : outfits.length === 0 ? (
                            <div className="text-gray-500 text-sm">У вас ещё нет сохранённых образов</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                                {outfits.map(outfit => (
                                    <button
                                        key={outfit.id}
                                        onClick={() => toggleSelectOutfit(outfit.id)}
                                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${selectedOutfitIds.includes(outfit.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-100 hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="grid grid-cols-2 gap-1 w-16 h-16">
                                            {outfit.previewItems.slice(0, 4).map((item, idx) => (
                                                <div key={idx} className="rounded-md overflow-hidden bg-gray-100">
                                                    <img
                                                        src={`${mediaBaseUrl}/${item.image_path}`}
                                                        alt={item.filename}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-gray-900">{outfit.name}</p>
                                            <p className="text-xs text-gray-500">{outfit.itemsCount} вещей • {outfit.occasion}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${selectedOutfitIds.includes(outfit.id) ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-300'}`}>
                                            <Icon name="check" size={14} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-5">
                            <button
                                onClick={() => setSelectedOutfitIds([])}
                                className="text-gray-500 text-sm hover:text-gray-700"
                            >
                                Снять выбор
                            </button>
                            <button
                                onClick={saveSelectedOutfits}
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

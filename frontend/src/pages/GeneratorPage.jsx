import { useState, useEffect, useCallback } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Icon from '../components/common/Icon'

/**
 * GeneratorPage - AI Генератор образов с Tinder-style свайп интерфейсом
 * 
 * 3 состояния:
 * 1. conditions - выбор условий (повод, погода)
 * 2. swipe - просмотр и оценка сгенерированных образов
 * 3. results - итоги сессии
 */
const GeneratorPage = () => {
    const { user } = useAuth()

    // Текущее состояние страницы
    const [stage, setStage] = useState('conditions') // conditions | swipe | results

    // Условия генерации
    const [occasion, setOccasion] = useState('casual')
    const [weatherCategory, setWeatherCategory] = useState('warm')
    const [weather, setWeather] = useState(null)

    // Сгенерированные образы
    const [outfits, setOutfits] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [carouselIndex, setCarouselIndex] = useState(0)

    // Статистика сессии
    const [stats, setStats] = useState({ saved: 0, favorited: 0, skipped: 0 })

    // UI состояния
    const [generating, setGenerating] = useState(false)
    const [swipeDirection, setSwipeDirection] = useState(null)

    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    // Загрузка погоды при монтировании
    useEffect(() => {
        fetchWeather()
    }, [])

    const goCarouselNext = useCallback(() => {
        setCarouselIndex(prev => {
            if (outfits.length === 0) return 0
            return (prev + 1) % outfits.length
        })
    }, [outfits.length])

    const goCarouselPrev = useCallback(() => {
        setCarouselIndex(prev => {
            if (outfits.length === 0) return 0
            return (prev - 1 + outfits.length) % outfits.length
        })
    }, [outfits.length])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            const targetTag = e.target?.tagName?.toLowerCase()
            if (targetTag === 'input' || targetTag === 'textarea' || e.target?.isContentEditable) return

            if (stage === 'swipe') {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault()
                        handleFeedback('dislike')
                        break
                    case 'ArrowRight':
                        e.preventDefault()
                        handleFeedback('like')
                        break
                    case 'ArrowUp':
                        e.preventDefault()
                        handleFeedback('favorite')
                        break
                    case 'ArrowDown':
                        e.preventDefault()
                        handleFeedback('save')
                        break
                    case 'Escape':
                        e.preventDefault()
                        setStage('conditions')
                        break
                    default:
                        break
                }
                return
            }

            if (stage === 'results' && outfits.length > 0) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault()
                        goCarouselPrev()
                        break
                    case 'ArrowRight':
                        e.preventDefault()
                        goCarouselNext()
                        break
                    case 'Escape':
                        e.preventDefault()
                        setStage('conditions')
                        break
                    default:
                        break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [stage, currentIndex, outfits.length, goCarouselPrev, goCarouselNext])

    const fetchWeather = async () => {
        try {
            const { data } = await api.get('/outfits/weather/current')
            setWeather(data)
            setWeatherCategory(data.category || 'warm')
        } catch (error) {
            console.log('Weather not available, using default')
            // Используем дефолтные значения
            setWeather({
                temp: 20,
                description: 'данные недоступны',
                city: 'Москва',
                category: 'warm'
            })
        }
    }

    // Генерация образов
    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const { data } = await api.post(`/outfits/generate?occasion=${occasion}&weather_category=${weatherCategory}&count=10`)
            setOutfits(data)
            setCurrentIndex(0)
            setCarouselIndex(0)
            setStats({ saved: 0, favorited: 0, skipped: 0 })
            setStage('swipe')
        } catch (error) {
            console.error('Generation failed:', error)
            alert(error.response?.data?.detail || 'Ошибка генерации')
        } finally {
            setGenerating(false)
        }
    }

    // Обработка действия над образом
    const handleFeedback = async (action) => {
        const currentOutfit = outfits[currentIndex]
        if (!currentOutfit) return

        // Анимация свайпа
        if (action === 'like' || action === 'save' || action === 'favorite') {
            setSwipeDirection('right')
        } else {
            setSwipeDirection('left')
        }

        // Отправляем feedback на сервер
        try {
            await api.post('/outfits/feedback', {
                action,
                item_ids: currentOutfit.items.map(i => i.id),
                occasion,
                weather: weatherCategory
            })

            // Обновляем статистику
            setStats(prev => ({
                ...prev,
                saved: prev.saved + (action === 'save' ? 1 : 0),
                favorited: prev.favorited + (action === 'favorite' ? 1 : 0),
                skipped: prev.skipped + (action === 'skip' || action === 'dislike' ? 1 : 0)
            }))
        } catch (error) {
            console.error('Feedback failed:', error)
        }

        // Переход к следующему образу
        setTimeout(() => {
            setSwipeDirection(null)
            if (currentIndex + 1 >= outfits.length) {
                setStage('results')
            } else {
                setCurrentIndex(prev => prev + 1)
            }
        }, 300)
    }

    // Сброс для новой сессии
    const handleNewSession = () => {
        setStage('conditions')
        setOutfits([])
        setCurrentIndex(0)
        setCarouselIndex(0)
    }

    // Получение цвета для score
    const getScoreColor = (score) => {
        if (score >= 0.75) return 'text-green-500'
        if (score >= 0.5) return 'text-yellow-500'
        return 'text-red-500'
    }

    const getScoreBgColor = (score) => {
        if (score >= 0.75) return 'bg-green-100'
        if (score >= 0.5) return 'bg-yellow-100'
        return 'bg-red-100'
    }

    // Опции выбора
    const occasions = [
        { id: 'casual', label: 'Прогулка', icon: 'sun' },
        { id: 'work', label: 'Работа', icon: 'briefcase' },
        { id: 'party', label: 'Вечеринка', icon: 'music' },
        { id: 'date', label: 'Свидание', icon: 'heart' },
        { id: 'sport', label: 'Спорт', icon: 'activity' }
    ]

    const weatherOptions = [
        { id: 'cold', label: 'Холодно', icon: 'cloud-snow', color: 'from-blue-400 to-blue-600' },
        { id: 'cool', label: 'Прохладно', icon: 'cloud', color: 'from-cyan-400 to-blue-500' },
        { id: 'warm', label: 'Тепло', icon: 'sun', color: 'from-yellow-400 to-orange-500' },
        { id: 'hot', label: 'Жарко', icon: 'thermometer', color: 'from-orange-400 to-red-500' }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="generator" user={user} />

            <main className="flex-grow container mx-auto max-w-2xl px-4 py-6">
                {/* STAGE 1: CONDITIONS */}
                {stage === 'conditions' && (
                    <div className="space-y-8">
                        {/* Weather Card */}
                        {weather && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white/80 text-sm">Погода в {weather.city}</p>
                                        <p className="text-3xl font-bold">{weather.temp}°C</p>
                                        <p className="text-white/80 capitalize">{weather.description}</p>
                                    </div>
                                    <div className="text-6xl">
                                        {weather.icon?.includes('01') ? '☀️' :
                                            weather.icon?.includes('02') ? '⛅' :
                                                weather.icon?.includes('03') ? '☁️' :
                                                    weather.icon?.includes('04') ? '☁️' :
                                                        weather.icon?.includes('09') ? '🌧️' :
                                                            weather.icon?.includes('10') ? '🌦️' :
                                                                weather.icon?.includes('11') ? '⛈️' :
                                                                    weather.icon?.includes('13') ? '❄️' : '🌤️'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Occasion Selection */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Куда собираетесь?</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {occasions.map(o => (
                                    <button
                                        key={o.id}
                                        onClick={() => setOccasion(o.id)}
                                        className={`p-4 rounded-xl border-2 transition-all ${occasion === o.id
                                            ? 'border-primary bg-primary/5 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon name={o.icon} size={24} className={occasion === o.id ? 'text-primary' : 'text-gray-400'} />
                                        <p className={`mt-2 font-medium ${occasion === o.id ? 'text-primary' : 'text-gray-700'}`}>
                                            {o.label}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weather Selection */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Погодные условия</h2>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {weatherOptions.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => setWeatherCategory(w.id)}
                                        className={`flex-shrink-0 px-5 py-3 rounded-xl transition-all flex items-center gap-2 ${weatherCategory === w.id
                                            ? `bg-gradient-to-r ${w.color} text-white shadow-lg`
                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon name={w.icon} size={18} />
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
                        >
                            {generating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                    Генерирую...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Icon name="sparkles" size={20} />
                                    Создать образы
                                </span>
                            )}
                        </button>

                        {/* Keyboard hints */}
                        <p className="text-center text-xs text-gray-400">
                            Во время просмотра используйте ←↓→↑ для навигации
                        </p>
                    </div>
                )}

                {/* STAGE 2: SWIPE */}
                {stage === 'swipe' && outfits.length > 0 && (
                    <div className="space-y-6 relative">
                        {/* Progress */}
                        <div className="flex items-center justify-between">
                            <button onClick={() => setStage('conditions')} className="text-gray-500 hover:text-gray-700">
                                <Icon name="x" size={24} />
                            </button>
                            <span className="text-sm font-medium text-gray-500">
                                {currentIndex + 1} из {outfits.length}
                            </span>
                            <div className="w-6" /> {/* Spacer */}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / outfits.length) * 100}%` }}
                            />
                        </div>

                        {/* Outfit Card with Navigation Arrows */}
                        <div className="relative">
                            {/* Left Arrow - Click to Dislike */}
                            <button
                                onClick={() => handleFeedback('dislike')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all hover:scale-110 hidden md:flex"
                            >
                                <Icon name="chevron-left" size={24} />
                            </button>

                            {/* Right Arrow - Click to Like */}
                            <button
                                onClick={() => handleFeedback('like')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all hover:scale-110 hidden md:flex"
                            >
                                <Icon name="chevron-right" size={24} />
                            </button>

                            <div className={`bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 transform ${swipeDirection === 'left' ? '-translate-x-full rotate-[-15deg] opacity-0' :
                                swipeDirection === 'right' ? 'translate-x-full rotate-[15deg] opacity-0' : ''
                                }`}>
                                {/* Items Grid */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {outfits[currentIndex]?.items.map((item, idx) => (
                                            <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                <img
                                                    src={`${mediaBaseUrl}/${item.image_path}`}
                                                    alt={item.filename}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Outfit Info */}
                                    <div className="mt-4 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {outfits[currentIndex]?.name}
                                        </h3>

                                        {/* Score with breakdown */}
                                        <div className="mt-2">
                                            <p className={`text-2xl font-bold ${getScoreColor(outfits[currentIndex]?.score)}`}>
                                                {Math.round(outfits[currentIndex]?.score * 100)}%
                                            </p>

                                            {/* Score breakdown */}
                                            {outfits[currentIndex]?.score_breakdown && (
                                                <div className="flex justify-center gap-2 mt-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getScoreBgColor(outfits[currentIndex]?.color_score)} ${getScoreColor(outfits[currentIndex]?.color_score)}`}>
                                                        🎨 {Math.round(outfits[currentIndex]?.color_score * 100)}%
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getScoreBgColor(outfits[currentIndex]?.style_score)} ${getScoreColor(outfits[currentIndex]?.style_score)}`}>
                                                        👔 {Math.round(outfits[currentIndex]?.style_score * 100)}%
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getScoreBgColor(outfits[currentIndex]?.weather_score)} ${getScoreColor(outfits[currentIndex]?.weather_score)}`}>
                                                        🌤️ {Math.round(outfits[currentIndex]?.weather_score * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 py-4">
                            {/* Dislike */}
                            <button
                                onClick={() => handleFeedback('dislike')}
                                className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-all hover:scale-110"
                            >
                                <Icon name="thumbs-down" size={24} />
                            </button>

                            {/* Like (for AI training) */}
                            <button
                                onClick={() => handleFeedback('like')}
                                className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all hover:scale-110"
                            >
                                <Icon name="thumbs-up" size={24} />
                            </button>

                            {/* Favorite */}
                            <button
                                onClick={() => handleFeedback('favorite')}
                                className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all hover:scale-110"
                            >
                                <Icon name="heart" size={28} />
                            </button>

                            {/* Save */}
                            <button
                                onClick={() => handleFeedback('save')}
                                className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-all hover:scale-110"
                            >
                                <Icon name="bookmark" size={24} />
                            </button>
                        </div>

                        {/* Button Labels with Keyboard Hints */}
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                            <span className="w-14 text-center">← Не то</span>
                            <span className="w-14 text-center">→ Нравится</span>
                            <span className="w-16 text-center">↑ Избранное</span>
                            <span className="w-14 text-center">↓ Сохранить</span>
                        </div>
                    </div>
                )}

                {/* STAGE 3: RESULTS */}
                {stage === 'results' && (
                    <div className="text-center space-y-8 py-12">
                        {/* Success Icon */}
                        <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <Icon name="check" size={48} className="text-white" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">Это все образы! 🎉</h2>
                        <p className="text-gray-500">Вы просмотрели {outfits.length} образов</p>

                        {/* Stats */}
                        <div className="flex justify-center gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-500">{stats.saved}</div>
                                <div className="text-sm text-gray-500">Сохранено</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-500">{stats.favorited}</div>
                                <div className="text-sm text-gray-500">В избранном</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-400">{stats.skipped}</div>
                                <div className="text-sm text-gray-500">Пропущено</div>
                            </div>
                        </div>

                        {/* Generated outfits carousel */}
                        {outfits.length > 0 && (
                            <div className="space-y-4 text-left">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Сгенерированные образы</h3>
                                    <span className="text-sm text-gray-500">
                                        {carouselIndex + 1} из {outfits.length}
                                    </span>
                                </div>

                                <div className="relative">
                                    {outfits.length > 1 && (
                                        <>
                                            <button
                                                onClick={goCarouselPrev}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all"
                                                aria-label="Предыдущий образ"
                                            >
                                                <Icon name="chevron-left" size={20} />
                                            </button>
                                            <button
                                                onClick={goCarouselNext}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all"
                                                aria-label="Следующий образ"
                                            >
                                                <Icon name="chevron-right" size={20} />
                                            </button>
                                        </>
                                    )}

                                    <div className="overflow-hidden rounded-2xl">
                                        <div
                                            className="flex transition-transform duration-300 ease-out"
                                            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                                        >
                                            {outfits.map((outfit, idx) => (
                                                <div key={idx} className="min-w-full px-1">
                                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {outfit.items?.slice(0, 4).map((item, itemIdx) => {
                                                                const showMoreOverlay = itemIdx === 3 && outfit.items?.length > 4
                                                                return (
                                                                    <div key={itemIdx} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                                                        <img
                                                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                                                            alt={item.filename}
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                        {showMoreOverlay && (
                                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm font-semibold">
                                                                                +{outfit.items.length - 4}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>

                                                        <div className="mt-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <h4 className="font-bold text-gray-900 truncate">{outfit.name}</h4>
                                                                <span className={`text-sm font-semibold ${getScoreColor(outfit.score)}`}>
                                                                    {Math.round(outfit.score * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                                                                <span>Повод: {outfit.occasion}</span>
                                                                <span>•</span>
                                                                <span>Погода: {outfit.weather}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {outfits.length > 1 && (
                                        <>
                                            <button
                                                onClick={goCarouselPrev}
                                                className="absolute inset-y-0 left-0 w-1/5 z-10 cursor-pointer bg-gradient-to-r from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                                                aria-label="Перелистнуть влево"
                                            />
                                            <button
                                                onClick={goCarouselNext}
                                                className="absolute inset-y-0 right-0 w-1/5 z-10 cursor-pointer bg-gradient-to-l from-black/5 to-transparent opacity-0 hover:opacity-100 transition-opacity"
                                                aria-label="Перелистнуть вправо"
                                            />
                                        </>
                                    )}
                                </div>

                                {outfits.length > 1 && (
                                    <div className="flex justify-center gap-2">
                                        {outfits.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCarouselIndex(idx)}
                                                className={`h-2 rounded-full transition-all duration-300 ${idx === carouselIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                                                aria-label={`Перейти к образу ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3 max-w-xs mx-auto">
                            <button
                                onClick={handleNewSession}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                Сгенерировать ещё
                            </button>
                            <button
                                onClick={() => window.location.href = '/outfits'}
                                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                            >
                                Перейти в образы
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <MobileNav activePage="generator" />
        </div>
    )
}

export default GeneratorPage


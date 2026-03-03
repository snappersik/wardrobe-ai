// =============================================================================
// СТРАНИЦА СТАТИСТИКИ ГАРДЕРОБА (StatsPage.jsx)
// =============================================================================
// Для Premium: полная статистика гардероба (категории, цвета, стили, забытые вещи)
// Для Free/Basic: промо-страница с предложением перейти на Premium
// =============================================================================

import { useState, useEffect } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Icon from '../components/common/Icon'
import UpgradeModal from '../components/common/UpgradeModal'

const StatsPage = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')
    const plan = user?.subscription_plan || 'free'
    const isPremium = plan === 'premium'

    useEffect(() => {
        if (isPremium) {
            fetchStats()
        } else {
            setLoading(false)
        }
    }, [isPremium])

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/stats/overview')
            setStats(data)
        } catch (err) {
            if (err.response?.status === 403) {
                setError('premium_required')
            } else {
                setError('fetch_failed')
            }
        } finally {
            setLoading(false)
        }
    }

    // ─── Промо-страница для Free/Basic ──────────────────────────────────
    if (!isPremium) {
        return (
            <div className="min-h-screen page-gradient flex flex-col">
                <UniversalHeader activePage="stats" user={user} />
                <main className="flex-grow container mx-auto max-w-2xl px-4 py-12">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Icon name="bar-chart-2" size={40} className="text-white" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Статистика гардероба
                        </h1>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Узнайте всё о своём гардеробе: какие вещи вы носите чаще всего,
                            какие цвета преобладают, и какие вещи забыты.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                            {[
                                { icon: 'pie-chart', label: 'Категории и стили' },
                                { icon: 'palette', label: 'Цветовой анализ' },
                                { icon: 'alert-circle', label: 'Забытые вещи' },
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/60 border border-gray-100">
                                    <Icon name={item.icon} size={24} className="text-amber-500 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                            Перейти на Premium
                        </button>

                        <p className="text-xs text-gray-400">
                            Статистика доступна только для Premium подписки
                        </p>
                    </div>
                </main>
                <MobileNav activePage="stats" />
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    currentPlan={plan}
                    reason="upgrade"
                />
            </div>
        )
    }

    // ─── Loading ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen page-gradient flex flex-col">
                <UniversalHeader activePage="stats" user={user} />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </main>
                <MobileNav activePage="stats" />
            </div>
        )
    }

    // ─── Максимальное значение для bar chart ────────────────────────────
    const maxCategoryCount = stats ? Math.max(...Object.values(stats.categories), 1) : 1
    const maxColorCount = stats ? Math.max(...Object.values(stats.colors), 1) : 1
    const maxStyleCount = stats ? Math.max(...Object.values(stats.styles), 1) : 1

    // ─── Цвета для отображения ──────────────────────────────────────────
    const COLOR_MAP = {
        black: '#000', white: '#fff', red: '#ef4444', blue: '#3b82f6',
        green: '#22c55e', yellow: '#eab308', pink: '#ec4899', purple: '#a855f7',
        orange: '#f97316', brown: '#92400e', gray: '#6b7280', beige: '#d4a574',
        navy: '#1e3a5f', burgundy: '#800020', olive: '#808000', coral: '#ff7f50',
        teal: '#008080', gold: '#ffd700', silver: '#c0c0c0', multicolor: 'linear-gradient(135deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)'
    }

    return (
        <div className="min-h-screen page-gradient flex flex-col">
            <UniversalHeader activePage="stats" user={user} />

            <main className="flex-grow container mx-auto max-w-4xl px-4 py-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Статистика гардероба</h1>
                    <p className="text-sm text-gray-500">Аналитика вашей коллекции</p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Вещей', value: stats?.total_items || 0, icon: 'shirt', color: 'from-blue-500 to-blue-600' },
                        { label: 'Образов', value: stats?.total_outfits || 0, icon: 'layers', color: 'from-purple-500 to-purple-600' },
                        { label: 'Стоимость', value: stats?.total_price ? `${stats.total_price.toLocaleString()} ₽` : '—', icon: 'credit-card', color: 'from-green-500 to-green-600' },
                        { label: 'Забыто', value: stats?.forgotten_items?.length || 0, icon: 'alert-circle', color: 'from-amber-500 to-orange-500' },
                    ].map((card, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-3`}>
                                <Icon name={card.icon} size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                            <div className="text-xs text-gray-500">{card.label}</div>
                        </div>
                    ))}
                </div>

                {/* Categories Bar Chart */}
                {stats?.categories && Object.keys(stats.categories).length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="pie-chart" size={20} className="text-blue-500" />
                            По категориям
                        </h3>
                        <div className="space-y-2.5">
                            {Object.entries(stats.categories)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 10)
                                .map(([cat, count]) => (
                                    <div key={cat} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-32 truncate text-right">{cat}</span>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                style={{ width: `${(count / maxCategoryCount) * 100}%`, minWidth: '24px' }}
                                            >
                                                <span className="text-xs text-white font-medium">{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Colors */}
                {stats?.colors && Object.keys(stats.colors).length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="palette" size={20} className="text-pink-500" />
                            По цветам
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {Object.entries(stats.colors)
                                .sort((a, b) => b[1] - a[1])
                                .map(([color, count]) => (
                                    <div key={color} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                                        <div
                                            className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                                            style={{ background: COLOR_MAP[color] || '#ddd' }}
                                        />
                                        <span className="text-sm text-gray-700 font-medium">{color}</span>
                                        <span className="text-xs text-gray-400">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Styles */}
                {stats?.styles && Object.keys(stats.styles).length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="tag" size={20} className="text-purple-500" />
                            По стилям
                        </h3>
                        <div className="space-y-2.5">
                            {Object.entries(stats.styles)
                                .sort((a, b) => b[1] - a[1])
                                .map(([style, count]) => (
                                    <div key={style} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-28 truncate text-right">{style}</span>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                                style={{ width: `${(count / maxStyleCount) * 100}%`, minWidth: '24px' }}
                                            >
                                                <span className="text-xs text-white font-medium">{count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Top Items */}
                {stats?.top_items?.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="trending-up" size={20} className="text-green-500" />
                            Топ-5 самых используемых
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {stats.top_items.map((item, i) => (
                                <div key={item.id} className="text-center">
                                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
                                        <img
                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                            alt={item.name}
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-700 truncate font-medium">{item.name}</p>
                                    <p className="text-xs text-gray-400">в {item.outfit_count} образах</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Forgotten Items */}
                {stats?.forgotten_items?.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Icon name="alert-circle" size={20} className="text-amber-500" />
                            Забытые вещи
                            <span className="text-xs text-gray-400 font-normal">
                                (не используются в образах)
                            </span>
                        </h3>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {stats.forgotten_items.map(item => (
                                <div key={item.id} className="text-center">
                                    <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2 ring-2 ring-amber-200">
                                        <img
                                            src={`${mediaBaseUrl}/${item.image_path}`}
                                            alt={item.name}
                                            className="w-full h-full object-contain opacity-75"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-600 truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-400">{item.category}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <MobileNav activePage="stats" />
        </div>
    )
}

export default StatsPage

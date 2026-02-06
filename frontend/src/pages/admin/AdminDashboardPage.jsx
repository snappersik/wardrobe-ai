import { useEffect, useMemo, useRef, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import Icon from '../../components/common/Icon'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const rangeLabels = {
    today: 'Сегодня',
    '7days': 'За последние 7 дней',
    '30days': 'За последние 30 дней',
    year: 'За год'
}

const formatNumber = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return new Intl.NumberFormat('ru-RU').format(value)
}

const formatChange = (value) => {
    const rounded = Math.abs(value).toFixed(1)
    return value >= 0 ? `+${rounded}%` : `-${rounded}%`
}

const getWeekdayLabel = (isoDate) => {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date)
}

const getDateLabel = (isoDate) => {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' }).format(date)
}

const getLinePositions = (count) => {
    if (!count) return []
    return Array.from({ length: count }, (_, idx) => ((idx + 0.5) / count) * 100)
}

const VerticalLines = ({ count }) => (
    <div className="absolute inset-0 pointer-events-none">
        {getLinePositions(count).map((left, idx) => (
            <span
                key={`line-${idx}`}
                className="absolute top-0 bottom-0 w-px bg-slate-200/70 -translate-x-1/2"
                style={{ left: `${left}%` }}
            />
        ))}
    </div>
)

const InfoPopover = ({ content, align = 'right' }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        if (!open) return undefined
        const handler = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Информация"
                type="button"
            >
                <Icon name="info" size={16} />
            </button>
            {open && (
                <div className={`absolute ${align === 'left' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white border border-white/70 shadow-lg rounded-xl p-3 text-xs text-gray-600 z-20`}>
                    {content}
                </div>
            )}
        </div>
    )
}

const MetricCard = ({ title, value, change, trend, icon, colorClass, glowClass, info }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 border border-white/70 shadow-sm p-5">
        <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                    <Icon name={trend === 'up' ? 'trending-up' : 'trending-down'} size={14} />
                    <span>{change}</span>
                    <span className="text-gray-400 font-normal ml-1">vs прошлый период</span>
                </div>
            </div>
            <div className="flex flex-col items-end gap-3">
                <InfoPopover content={info} />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${colorClass}`}>
                    <Icon name={icon} size={20} />
                </div>
            </div>
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 ${glowClass}`} />
    </div>
)

const LineChartCard = ({ title, data, info }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70 h-full flex items-center justify-center text-gray-400">
                Нет данных
            </div>
        )
    }
    const values = data.map(d => d.value)
    const maxValue = Math.max(...values, 1)
    const points = data.map((item, idx) => {
        const x = (idx / Math.max(data.length - 1, 1)) * 100
        const y = 100 - (item.value / maxValue) * 80 - 10
        return `${x},${y}`
    })

    const pathD = `M${points.join(' L')}`
    const areaD = `${pathD} L100,100 L0,100 Z`

    return (
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <InfoPopover content={info} />
            </div>
            <div className="relative h-64">
                <VerticalLines count={data.length} />
                <div className="absolute inset-x-0 top-0 bottom-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ff91af" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#ff91af" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#lineGradient)" />
                        <path d={pathD} fill="none" stroke="#ff91af" strokeWidth="2" strokeLinecap="round" />
                        {data.map((item, idx) => {
                            const [x, y] = points[idx].split(',')
                            return (
                                <circle key={item.date} cx={x} cy={y} r="2.5" fill="#fff" stroke="#ff91af" strokeWidth="1.5" />
                            )
                        })}
                    </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex items-center text-xs text-gray-400">
                    {data.map((item, idx) => (
                        <span key={item.date} className="flex-1 text-center">
                            {data.length <= 10 ? getWeekdayLabel(item.date) : (idx % 5 === 0 ? getDateLabel(item.date) : '')}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

const BarChartCard = ({ title, data, info }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70 h-full flex items-center justify-center text-gray-400">
                Нет данных
            </div>
        )
    }
    const maxValue = Math.max(...data.map(d => d.value), 1)
    const hasActivity = data.some(item => item.value > 0)

    return (
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <InfoPopover content={info} />
            </div>
            {!hasActivity && (
                <div className="text-xs text-gray-400 mb-2">Пока нет активности генератора за выбранный период</div>
            )}
            <div className="relative h-64">
                <VerticalLines count={data.length} />
                <div className="absolute inset-x-0 top-0 bottom-6 flex items-end justify-between gap-3">
                    {data.map(item => (
                        <div key={item.date} className="flex-1 flex items-end justify-center">
                            <div
                                className={`w-full rounded-xl bg-gradient-to-t from-purple-500 to-purple-300 ${item.value === 0 ? 'opacity-60' : ''}`}
                                style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex items-center text-xs text-gray-400">
                    {data.map((item, idx) => (
                        <span key={item.date} className="flex-1 text-center">
                            {data.length <= 10 ? getWeekdayLabel(item.date) : getDateLabel(item.date)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

const AdminDashboardPage = () => {
    const { user } = useAuth()
    const [dateRange, setDateRange] = useState('7days')
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState(null)
    const [series, setSeries] = useState({ registrations: [], generator_activity: [] })

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true)
                const { data } = await api.get('/admin/analytics', {
                    params: { range: dateRange }
                })
                setMetrics(data.metrics)
                setSeries(data.series)
            } catch (error) {
                console.error('Failed to fetch admin analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        if (user?.role === 'admin') {
            fetchAnalytics()
        }
    }, [user, dateRange])

    const metricCards = useMemo(() => {
        if (!metrics) return []
        return [
            {
                title: 'Всего пользователей',
                value: formatNumber(metrics.total_users.value || 0),
                change: formatChange(metrics.total_users.change || 0),
                trend: metrics.total_users.trend,
                icon: 'users',
                colorClass: 'bg-blue-500',
                glowClass: 'bg-blue-500',
                info: 'Количество всех зарегистрированных пользователей в системе.'
            },
            {
                title: dateRange === 'today' ? 'Активные сегодня' : 'Активные за период',
                value: formatNumber(metrics.active_users.value || 0),
                change: formatChange(metrics.active_users.change || 0),
                trend: metrics.active_users.trend,
                icon: 'activity',
                colorClass: 'bg-green-500',
                glowClass: 'bg-green-500',
                info: 'Уникальные пользователи, проявившие активность за выбранный период.'
            },
            {
                title: 'Создано образов',
                value: formatNumber(metrics.created_outfits.value || 0),
                change: formatChange(metrics.created_outfits.change || 0),
                trend: metrics.created_outfits.trend,
                icon: 'layers',
                colorClass: 'bg-pink-500',
                glowClass: 'bg-pink-500',
                info: 'Количество созданных образов за выбранный период.'
            },
            {
                title: 'Загружено вещей',
                value: formatNumber(metrics.uploaded_items.value || 0),
                change: formatChange(metrics.uploaded_items.change || 0),
                trend: metrics.uploaded_items.trend,
                icon: 'hanger',
                colorClass: 'bg-purple-500',
                glowClass: 'bg-purple-500',
                info: 'Сколько предметов гардероба было загружено за выбранный период.'
            }
        ]
    }, [metrics, dateRange])

    return (
        <AdminLayout activePage="analytics">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>

                <div className="inline-flex items-center rounded-2xl bg-white/80 border border-white/70 p-1 shadow-sm">
                    {Object.entries(rangeLabels).map(([value, label]) => {
                        const active = dateRange === value
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setDateRange(value)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-primary text-white shadow'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                                }`}
                                aria-pressed={active}
                            >
                                {label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-2xl bg-white/70 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metricCards.map((card, idx) => (
                        <div key={idx} className="animate-fade-up" style={{ animationDelay: `${idx * 80}ms` }}>
                            <MetricCard {...card} />
                        </div>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
                    <LineChartCard
                    title="Рост аудитории"
                    data={series.registrations || []}
                    info="Динамика регистраций пользователей за выбранный период."
                />
                </div>
                <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                    <BarChartCard
                    title="Активность генератора"
                    data={series.generator_activity || []}
                    info="Количество образов, сгенерированных ИИ, по дням."
                />
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminDashboardPage

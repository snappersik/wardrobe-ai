import { useEffect, useMemo, useState } from 'react'
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

const MetricCard = ({ title, value, change, trend, icon, colorClass, glowClass }) => (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 border border-white/70 shadow-sm p-5">
        <div className="relative z-10">
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                <Icon name={trend === 'up' ? 'trending-up' : 'trending-down'} size={14} />
                <span>{change}</span>
                <span className="text-gray-400 font-normal ml-1">vs прошлый период</span>
            </div>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${colorClass}`}>
            <Icon name={icon} size={20} />
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 ${glowClass}`} />
    </div>
)

const LineChartCard = ({ title, data }) => {
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
                <button className="text-gray-400 hover:text-primary transition-colors">
                    <Icon name="info" size={18} />
                </button>
            </div>
            <div className="h-64">
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
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                {data.map((item, idx) => (
                    <span key={item.date} className="flex-1 text-center">
                        {data.length <= 10 ? getWeekdayLabel(item.date) : (idx % 5 === 0 ? getDateLabel(item.date) : '')}
                    </span>
                ))}
            </div>
        </div>
    )
}

const BarChartCard = ({ title, data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70 h-full flex items-center justify-center text-gray-400">
                Нет данных
            </div>
        )
    }
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="bg-white/80 rounded-2xl p-6 shadow-sm border border-white/70">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                <button className="text-gray-400 hover:text-primary transition-colors">
                    <Icon name="info" size={18} />
                </button>
            </div>
            <div className="h-64 flex items-end justify-between gap-3">
                {data.map(item => (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                        <div
                            className="w-full rounded-xl bg-gradient-to-t from-purple-500 to-purple-300"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        />
                        <span className="text-xs text-gray-400">
                            {data.length <= 10 ? getWeekdayLabel(item.date) : getDateLabel(item.date)}
                        </span>
                    </div>
                ))}
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
                glowClass: 'bg-blue-500'
            },
            {
                title: dateRange === 'today' ? 'Активные сегодня' : 'Активные за период',
                value: formatNumber(metrics.active_users.value || 0),
                change: formatChange(metrics.active_users.change || 0),
                trend: metrics.active_users.trend,
                icon: 'activity',
                colorClass: 'bg-green-500',
                glowClass: 'bg-green-500'
            },
            {
                title: 'Создано образов',
                value: formatNumber(metrics.created_outfits.value || 0),
                change: formatChange(metrics.created_outfits.change || 0),
                trend: metrics.created_outfits.trend,
                icon: 'layers',
                colorClass: 'bg-pink-500',
                glowClass: 'bg-pink-500'
            },
            {
                title: 'Загружено вещей',
                value: formatNumber(metrics.uploaded_items.value || 0),
                change: formatChange(metrics.uploaded_items.change || 0),
                trend: metrics.uploaded_items.trend,
                icon: 'hanger',
                colorClass: 'bg-purple-500',
                glowClass: 'bg-purple-500'
            }
        ]
    }, [metrics, dateRange])

    return (
        <AdminLayout activePage="dashboard">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>

                <div className="relative">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="appearance-none bg-white/80 border border-white/70 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-primary cursor-pointer text-sm font-medium shadow-sm hover:bg-white transition-colors"
                    >
                        {Object.entries(rangeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <Icon name="chevron-down" size={16} />
                    </div>
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
                        <MetricCard key={idx} {...card} />
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
                <LineChartCard
                    title="Рост аудитории"
                    data={series.registrations || []}
                />
                <BarChartCard
                    title="Активность генератора"
                    data={series.generator_activity || []}
                />
            </div>
        </AdminLayout>
    )
}

export default AdminDashboardPage

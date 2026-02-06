import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { getLogBadgeLabel, getLogLevel } from '../../utils/logs'

export default function AdminHeader({ onMenuClick }) {
    const { user } = useAuth()
    const [alertsOpen, setAlertsOpen] = useState(false)
    const [alertsLoading, setAlertsLoading] = useState(false)
    const [alerts, setAlerts] = useState([])
    const [alertCount, setAlertCount] = useState(0)
    const popoverRef = useRef(null)
    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')
    const displayName = user?.full_name || user?.username || 'Администратор'
    const subtitle = 'администратор'
    const avatarSrc = user?.avatar_path
        ? `${mediaBaseUrl}/${user.avatar_path}`
        : 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=80'

    const fetchAlerts = useCallback(async () => {
        try {
            setAlertsLoading(true)
            const { data } = await api.get('/admin/logs', { params: { limit: 50 } })
            const rawLogs = Array.isArray(data) ? data : (data?.items || data?.logs || [])
            const normalized = rawLogs.map(log => ({ ...log, level: getLogLevel(log) }))
            const critical = normalized.filter(log => log.level === 'warning' || log.level === 'error')
            setAlerts(critical.slice(0, 6))
            setAlertCount(critical.length)
        } catch (error) {
            console.error('Failed to fetch alerts', error)
        } finally {
            setAlertsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAlerts()
    }, [fetchAlerts])

    useEffect(() => {
        if (alertsOpen) {
            fetchAlerts()
        }
    }, [alertsOpen, fetchAlerts])

    useEffect(() => {
        if (!alertsOpen) return undefined
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setAlertsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [alertsOpen])

    const alertBadgeLabel = useMemo(() => {
        if (!alertCount) return null
        return alertCount > 9 ? '9+' : String(alertCount)
    }, [alertCount])

    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/70 px-4 md:px-8 py-3">
            <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Открыть меню"
                    >
                        <Icon name="menu" size={20} />
                    </button>
                    <Link
                        to="/"
                        className="flex lg:hidden items-center gap-2 text-gray-900 font-bold tracking-tight hover:text-primary transition-colors whitespace-nowrap"
                    >
                        <span className="text-base sm:text-lg">Умный Гардероб</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative" ref={popoverRef}>
                        <button
                            onClick={() => setAlertsOpen(prev => !prev)}
                            className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                            aria-label="Уведомления"
                            aria-expanded={alertsOpen}
                        >
                            <Icon name="bell" size={18} />
                            {alertBadgeLabel && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center border-2 border-white">
                                    {alertBadgeLabel}
                                </span>
                            )}
                        </button>

                        {alertsOpen && (
                            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-white/70 p-3 z-50">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-semibold text-gray-900">Уведомления</div>
                                    <Link to="/admin/logs" className="text-xs text-primary hover:text-primary-hover">
                                        Все логи
                                    </Link>
                                </div>

                                {alertsLoading ? (
                                    <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                                ) : alerts.length === 0 ? (
                                    <div className="text-sm text-gray-500 py-4 text-center">
                                        Ошибок и предупреждений нет
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {alerts.map((log) => (
                                            <div key={log._id || log.id || `${log.action}-${log.timestamp}`} className="flex gap-3 p-2 rounded-xl hover:bg-gray-50">
                                                <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center ${
                                                    log.level === 'error' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    <Icon name={log.level === 'error' ? 'alert-triangle' : 'info'} size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-xs font-semibold text-gray-900">{getLogBadgeLabel(log)}</div>
                                                    <div className="text-xs text-gray-500 max-h-8 overflow-hidden">{log.details || log.message || 'Событие'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-gray-900">{displayName}</div>
                            <div className="text-xs text-gray-500">{subtitle}</div>
                        </div>
                        <button
                            type="button"
                            className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-primary/30 hover:ring-offset-2 transition-all"
                            aria-label="Аватар администратора"
                        >
                            <img
                                src={avatarSrc}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

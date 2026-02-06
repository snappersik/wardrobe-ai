import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import LogsList from '../../components/admin/LogsList'
import Icon from '../../components/common/Icon'
import api from '../../api/axios'
import { getLogLevel } from '../../utils/logs'
import { exportLogsToCsv, exportLogsToExcel, exportLogsToJson, exportLogsToPdf } from '../../utils/export'

const PAGE_SIZE = 10

const AdminLogsPage = () => {
    const [filter, setFilter] = useState('all')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [isExportOpen, setIsExportOpen] = useState(false)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/logs', { params: { limit: 500 } })
            setLogs(Array.isArray(data) ? data : (data?.items || data?.logs || []))
        } catch (error) {
            console.error('Failed to fetch logs', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format) => {
        try {
            const data = filteredLogs
            if (format === 'json') {
                exportLogsToJson(data)
                return
            }
            if (format === 'csv') {
                exportLogsToCsv(data)
                return
            }
            if (format === 'xlsx') {
                await exportLogsToExcel(data)
                return
            }
            if (format === 'pdf') {
                await exportLogsToPdf(data)
            }
        } catch (error) {
            console.error('Export failed', error)
        }
    }

    const filteredLogs = useMemo(() => {
        if (filter === 'all') return logs
        return logs.filter(log => getLogLevel(log) === filter)
    }, [filter, logs])

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const pagedLogs = filteredLogs.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    const counts = useMemo(() => ({
        all: logs.length,
        info: logs.filter(log => getLogLevel(log) === 'info').length,
        warning: logs.filter(log => getLogLevel(log) === 'warning').length,
        error: logs.filter(log => getLogLevel(log) === 'error').length
    }), [logs])

    const filters = [
        { id: 'all', label: 'Все' },
        { id: 'info', label: 'Инфо' },
        { id: 'warning', label: 'Предупр.' },
        { id: 'error', label: 'Ошибки' },
    ]

    return (
        <AdminLayout activePage="logs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                        <Icon name="arrow-left" size={22} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Системные логи</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* EXPORT BUTTON & DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className="px-4 py-2 rounded-xl border border-white/70 bg-white/80 text-sm font-medium text-gray-700 hover:bg-white flex items-center gap-2"
                        >
                            <Icon name="download" size={16} />
                            Export
                            <Icon name="chevron-down" size={14} className={`transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isExportOpen && (
                            <>
                                {/* Overlay to close menu on outside click */}
                                <div className="fixed inset-0 z-10" onClick={() => setIsExportOpen(false)} />

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 flex flex-col">
                                    <button onClick={() => { handleExport('json'); setIsExportOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                        <Icon name="file-json" size={16} className="text-yellow-500" />
                                        <span>JSON</span>
                                    </button>
                                    <button onClick={() => { handleExport('csv'); setIsExportOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                        <Icon name="file-csv" size={16} className="text-green-600" />
                                        <span>CSV</span>
                                    </button>
                                    <button onClick={() => { handleExport('xlsx'); setIsExportOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                        <Icon name="file-excel" size={16} className="text-green-500" />
                                        <span>Excel</span>
                                    </button>
                                    <button onClick={() => { handleExport('pdf'); setIsExportOpen(false) }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                                        <Icon name="file-pdf" size={16} className="text-red-500" />
                                        <span>PDF</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setFilter(f.id)
                                setPage(1)
                            }}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm flex items-center gap-2 ${filter === f.id
                                ? 'bg-primary text-white'
                                : 'bg-white/80 border border-white/70 hover:bg-white'
                                }`}
                        >
                            {f.label}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {counts[f.id]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 rounded-2xl bg-white/70 animate-pulse" />
            ) : (
                <>
                    {pagedLogs.length === 0 ? (
                        <div className="bg-white/80 rounded-2xl p-8 shadow-sm border border-white/70 text-center text-gray-500">
                            Нет логов для выбранного фильтра
                        </div>
                    ) : (
                        <LogsList logs={pagedLogs} />
                    )}

                    {filteredLogs.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500">
                                Страница {safePage} из {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={safePage === 1}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/70 bg-white/80 text-gray-700 disabled:opacity-40"
                                >
                                    Назад
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={safePage === totalPages}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/70 bg-white/80 text-gray-700 disabled:opacity-40"
                                >
                                    Вперёд
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AdminLayout>
    )
}

export default AdminLogsPage

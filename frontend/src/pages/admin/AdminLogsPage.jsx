import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import LogsList from '../../components/admin/LogsList'
import Icon from '../../components/common/Icon'
import api from '../../api/axios'

const AdminLogsPage = () => {
    const [filter, setFilter] = useState('all')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/logs')
            setLogs(data)
        } catch (error) {
            console.error('Failed to fetch logs', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format) => {
        try {
            const response = await api.get(`/admin/logs/export?format=${format}`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `logs_export.${format}`)
            document.body.appendChild(link)
            link.click()
        } catch (error) {
            console.error('Export failed', error)
        }
    }

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
                    <button onClick={() => handleExport('json')} className="px-4 py-2 rounded-xl border border-white/70 bg-white/80 text-sm font-medium text-gray-700 hover:bg-white">
                        Export JSON
                    </button>
                    {filters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-colors text-sm ${filter === f.id
                                ? 'bg-primary text-white'
                                : 'bg-white/80 border border-white/70 hover:bg-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 rounded-2xl bg-white/70 animate-pulse" />
            ) : (
                <LogsList logs={logs} />
            )}
        </AdminLayout>
    )
}

export default AdminLogsPage

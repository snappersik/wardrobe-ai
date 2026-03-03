// =============================================================================
// СТРАНИЦА ML ОБУЧЕНИЯ (AdminMLPage.jsx) — Phase 2
// =============================================================================
// Форма запуска обучения ResNet-50, прогресс-бар, лог-консоль, история.
// =============================================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import Icon from '../../components/common/Icon'
import api from '../../api/axios'

// Статус-бейджи
const STATUS_MAP = {
    PENDING: { label: 'Ожидание', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    TRAINING: { label: 'Обучение', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
    COMPLETED: { label: 'Завершено', color: 'bg-green-100 text-green-700', icon: '✅' },
    FAILED: { label: 'Ошибка', color: 'bg-red-100 text-red-700', icon: '❌' },
    CANCELLED: { label: 'Отменено', color: 'bg-gray-100 text-gray-700', icon: '🚫' },
}

function StatusBadge({ status }) {
    const cfg = STATUS_MAP[status] || STATUS_MAP.PENDING
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    )
}

export default function AdminMLPage() {
    // Форма
    const [epochs, setEpochs] = useState(15)
    const [batchSize, setBatchSize] = useState(32)
    const [starting, setStarting] = useState(false)

    // Активная задача
    const [activeJob, setActiveJob] = useState(null)
    const [logs, setLogs] = useState([])
    const [polling, setPolling] = useState(false)
    const pollingRef = useRef(null)

    // История
    const [history, setHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(true)

    const logEndRef = useRef(null)

    // Загрузка истории
    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await api.get('/admin/ml/history')
            setHistory(data)
            // Если есть активное обучение — начать опрос
            const active = data.find(j => j.status === 'PENDING' || j.status === 'TRAINING')
            if (active) {
                setActiveJob(active)
                setPolling(true)
            }
        } catch (err) {
            console.error('Failed to fetch ML history', err)
        } finally {
            setLoadingHistory(false)
        }
    }, [])

    useEffect(() => { fetchHistory() }, [fetchHistory])

    // Поллинг статуса активной задачи
    useEffect(() => {
        if (!polling || !activeJob) return

        const poll = async () => {
            try {
                const { data } = await api.get(`/admin/ml/status/${activeJob.job_id}`)
                setActiveJob(data)
                if (data.logs) setLogs(data.logs)

                if (data.status === 'COMPLETED' || data.status === 'FAILED' || data.status === 'CANCELLED') {
                    setPolling(false)
                    fetchHistory()
                }
            } catch (err) {
                console.error('Polling error', err)
            }
        }

        pollingRef.current = setInterval(poll, 2000)
        poll() // сразу первый запрос

        return () => clearInterval(pollingRef.current)
    }, [polling, activeJob?.job_id])

    // Автоскролл логов
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    // Запуск обучения
    const handleStartTraining = async () => {
        setStarting(true)
        try {
            const { data } = await api.post('/admin/ml/train', null, {
                params: { epochs, batch_size: batchSize, model_type: 'resnet50' }
            })
            setActiveJob(data)
            setLogs([])
            setPolling(true)
        } catch (err) {
            const detail = err.response?.data?.detail || 'Не удалось запустить обучение'
            alert(detail)
        } finally {
            setStarting(false)
        }
    }

    // Отмена обучения
    const handleCancel = async () => {
        if (!activeJob) return
        try {
            await api.post(`/admin/ml/cancel/${activeJob.job_id}`)
            setPolling(false)
            fetchHistory()
        } catch (err) {
            alert('Не удалось отменить обучение')
        }
    }

    const isTraining = activeJob && (activeJob.status === 'TRAINING' || activeJob.status === 'PENDING')

    return (
        <AdminLayout activePage="ml">
            {/* Заголовок */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                    <Icon name="arrow-left" size={22} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">ML Обучение</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ==================== ФОРМА ЗАПУСКА ==================== */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 p-5">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">🧠 Запуск обучения</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Модель</label>
                                <div className="px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-800 font-medium">
                                    ResNet-50 (Multi-Head)
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Эпохи: <span className="text-primary font-bold">{epochs}</span>
                                </label>
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    value={epochs}
                                    onChange={(e) => setEpochs(+e.target.value)}
                                    className="w-full accent-primary"
                                    disabled={isTraining}
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>1</span><span>25</span><span>50</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Batch Size: <span className="text-primary font-bold">{batchSize}</span>
                                </label>
                                <select
                                    value={batchSize}
                                    onChange={(e) => setBatchSize(+e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm"
                                    disabled={isTraining}
                                >
                                    {[8, 16, 32, 64, 128].map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>

                            {isTraining ? (
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    ✋ Отменить обучение
                                </button>
                            ) : (
                                <button
                                    onClick={handleStartTraining}
                                    disabled={starting}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    {starting ? '⏳ Запуск...' : '🚀 Начать обучение'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ==================== ПРОГРЕСС + ЛОГИ ==================== */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Карточка прогресса */}
                    {activeJob && (
                        <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800">Прогресс</h2>
                                <StatusBadge status={activeJob.status} />
                            </div>

                            {/* Прогресс-бар */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm text-gray-500 mb-1">
                                    <span>Эпоха {activeJob.current_epoch || 0} / {activeJob.epochs}</span>
                                    <span>{(activeJob.progress || 0).toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${activeJob.status === 'TRAINING' ? 'bg-gradient-to-r from-blue-400 to-primary animate-pulse' :
                                                activeJob.status === 'COMPLETED' ? 'bg-green-500' :
                                                    activeJob.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-300'
                                            }`}
                                        style={{ width: `${activeJob.progress || 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Метрики */}
                            {activeJob.metrics && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                    {Object.entries(activeJob.metrics).map(([key, val]) => (
                                        <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                                            <div className="text-xs text-gray-400 mb-0.5">{key}</div>
                                            <div className="text-sm font-bold text-gray-800">
                                                {typeof val === 'number' ? val.toFixed(4) : val}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ошибка */}
                            {activeJob.error_message && (
                                <div className="bg-red-50 rounded-xl p-3 text-sm text-red-700 mb-4">
                                    <strong>Ошибка:</strong> {activeJob.error_message}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Лог-консоль */}
                    {logs.length > 0 && (
                        <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2 text-xs text-gray-400 font-mono">ML Training Log</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto font-mono text-xs space-y-0.5 scrollbar-hide">
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-gray-500 shrink-0">
                                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                                        </span>
                                        <span className={
                                            log.action?.includes('error') ? 'text-red-400' :
                                                log.action?.includes('warning') ? 'text-yellow-400' :
                                                    log.action?.includes('epoch') ? 'text-cyan-400' :
                                                        'text-green-400'
                                        }>
                                            {log.details}
                                        </span>
                                    </div>
                                ))}
                                <div ref={logEndRef} />
                            </div>
                        </div>
                    )}

                    {/* ==================== ИСТОРИЯ ==================== */}
                    <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 p-5">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">📋 История обучений</h2>

                        {loadingHistory ? (
                            <div className="text-center py-8 text-gray-400">Загрузка...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                                <div className="text-3xl mb-2">🤖</div>
                                <p>Ещё нет обучений</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium">Статус</th>
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium">Модель</th>
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium">Эпохи</th>
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium">Дата</th>
                                            <th className="px-3 py-2 text-left text-gray-500 font-medium">Accuracy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map(job => (
                                            <tr key={job.job_id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                                <td className="px-3 py-2.5"><StatusBadge status={job.status} /></td>
                                                <td className="px-3 py-2.5 text-gray-700">{job.model_type}</td>
                                                <td className="px-3 py-2.5 text-gray-700">{job.current_epoch}/{job.epochs}</td>
                                                <td className="px-3 py-2.5 text-gray-500 text-xs">
                                                    {job.start_time ? new Date(job.start_time).toLocaleString() : '-'}
                                                </td>
                                                <td className="px-3 py-2.5 text-gray-700 font-medium">
                                                    {job.metrics?.accuracy
                                                        ? `${(job.metrics.accuracy * 100).toFixed(1)}%`
                                                        : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

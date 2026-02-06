import { getLogBadgeLabel, getLogLevel } from '../../utils/logs'

const LogsList = ({ logs }) => {
    return (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 overflow-hidden">
            <div className="divide-y divide-gray-100">
                {logs.map(log => {
                    const level = getLogLevel(log)
                    const badgeClass = level === 'error'
                        ? 'bg-red-100 text-red-600'
                        : level === 'warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-600'

                    return (
                        <div key={log._id || log.id} className="px-6 py-4 hover:bg-white">
                            <div className="flex items-start gap-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${badgeClass}`}>
                                    {getLogBadgeLabel(log)}
                                </span>
                                <div className="flex-1">
                                    <p className="text-gray-900">{log.details || log.message}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : `${log.date} • ${log.time}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default LogsList

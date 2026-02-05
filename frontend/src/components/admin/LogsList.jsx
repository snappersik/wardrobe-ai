const LogsList = ({ logs }) => {
    const getTypeStyles = (type) => {
        switch (type) {
            case 'error': return 'bg-red-100 text-red-600';
            case 'warning': return 'bg-yellow-100 text-yellow-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    return (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 overflow-hidden">
            <div className="divide-y divide-gray-100">
                {logs.map(log => (
                    <div key={log._id || log.id} className="px-6 py-4 hover:bg-white">
                        <div className="flex items-start gap-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600`}>
                                {(log.action || log.type || 'info').toUpperCase()}
                            </span>
                            <div className="flex-1">
                                <p className="text-gray-900">{log.details || log.message}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : `${log.date} • ${log.time}`}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LogsList;

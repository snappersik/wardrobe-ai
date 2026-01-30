import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import LogsList from '../../components/admin/LogsList';
import Icon from '../../components/common/Icon';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminLogsPage = () => {
    const { user } = useAuth();
    const [filter, setFilter] = useState('all');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/admin/logs');
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await api.get(`/admin/logs/export?format=${format}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `logs_export.${format}`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Export failed', error);
        }
    };

    const filters = [
        { id: 'all', label: 'Все' },
        { id: 'info', label: 'Инфо' },
        { id: 'warning', label: 'Предупр.' },
        { id: 'error', label: 'Ошибки' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="admin" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                            <Icon name="arrow-left" size={24} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Системные логи</h1>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleExport('json')} className="btn btn-outline py-2 px-4 text-sm">
                            Export JSON
                        </button>
                        {filters.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f.id
                                    ? 'bg-primary text-white'
                                    : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <LogsList logs={logs} />
            </main>
        </div>
    );
};

export default AdminLogsPage;

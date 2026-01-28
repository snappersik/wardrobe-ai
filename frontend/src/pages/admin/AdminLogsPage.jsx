import { useState } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import LogsList from '../../components/admin/LogsList';

const AdminLogsPage = () => {
    const [filter, setFilter] = useState('all');

    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: true
    };

    const logs = [
        { id: 1, type: 'info', message: 'Пользователь maria@example.com создал новый образ', time: '10:45:23', date: '2023-10-15' },
        { id: 2, type: 'warning', message: 'Попытка входа с неверным паролем для elena@example.com', time: '10:42:15', date: '2023-10-15' },
        { id: 3, type: 'error', message: 'Ошибка генерации образа для пользователя ID: 1234', time: '10:38:45', date: '2023-10-15' },
        { id: 4, type: 'info', message: 'Пользователь olga@example.com обновил профиль', time: '10:35:12', date: '2023-10-15' },
        { id: 5, type: 'info', message: 'Новая регистрация: anna.n@example.com', time: '10:30:00', date: '2023-10-15' },
    ];

    const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter);

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
                            <div className="icon-arrow-left text-xl"></div>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Системные логи</h1>
                    </div>
                    <div className="flex gap-2">
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

                <LogsList logs={filteredLogs} />
            </main>
        </div>
    );
};

export default AdminLogsPage;

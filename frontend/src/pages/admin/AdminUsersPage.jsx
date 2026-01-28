import { useState } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import UsersTable from '../../components/admin/UsersTable';

const AdminUsersPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: true
    };

    const users = [
        { id: 1, name: 'Мария Иванова', email: 'maria@example.com', plan: 'Premium', status: 'active', items: 45, outfits: 12, joined: '2023-08-15' },
        { id: 2, name: 'Елена Смирнова', email: 'elena@example.com', plan: 'Free', status: 'active', items: 12, outfits: 3, joined: '2023-09-20' },
        { id: 3, name: 'Ольга Козлова', email: 'olga@example.com', plan: 'Premium', status: 'inactive', items: 67, outfits: 24, joined: '2023-07-10' },
        { id: 4, name: 'Анна Новикова', email: 'anna.n@example.com', plan: 'Free', status: 'active', items: 8, outfits: 2, joined: '2023-10-01' },
    ];

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="admin" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                            <div className="icon-arrow-left text-xl"></div>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
                    </div>
                    <div className="relative w-64">
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <div className="icon-search text-lg"></div>
                        </div>
                    </div>
                </div>

                <UsersTable users={filteredUsers} />
            </main>
        </div>
    );
};

export default AdminUsersPage;

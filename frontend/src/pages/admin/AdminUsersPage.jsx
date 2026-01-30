import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import UsersTable from '../../components/admin/UsersTable';
import Icon from '../../components/common/Icon';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';

const AdminUsersPage = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, null, {
                params: { role: newRole }
            });
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
            setToast({ message: 'Роль успешно обновлена', type: 'success' });
        } catch (error) {
            setToast({ message: 'Ошибка обновления роли', type: 'error' });
        }
    };

    const filteredUsers = users.filter(u =>
        (u.username?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="admin" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                            <Icon name="arrow-left" size={24} />
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
                            <Icon name="search" size={18} />
                        </div>
                    </div>
                </div>

                <UsersTable users={filteredUsers} onRoleChange={handleRoleChange} />
            </main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminUsersPage;

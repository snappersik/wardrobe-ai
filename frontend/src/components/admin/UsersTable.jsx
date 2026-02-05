import Icon from '../common/Icon';

const UsersTable = ({ users, onRoleChange }) => {
    return (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-white/70 overflow-hidden">
            <table className="w-full">
                <thead className="bg-white/70 border-b border-white/70">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Пользователь</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Роль</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Город</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Дата регистрации</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b border-white/70 hover:bg-white">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                                        {u.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{u.full_name || u.username}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    value={u.role}
                                    onChange={(e) => onRoleChange && onRoleChange(u.id, e.target.value)}
                                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 border-none focus:ring-2 focus:ring-primary cursor-pointer"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{u.city || '-'}</td>
                            <td className="px-6 py-4 text-gray-600">
                                {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <Icon name="more-vertical" size={18} className="text-gray-400" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UsersTable;

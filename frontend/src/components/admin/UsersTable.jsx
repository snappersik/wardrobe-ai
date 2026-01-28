const UsersTable = ({ users }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Пользователь</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">План</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Статус</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Вещей</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Образов</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Дата регистрации</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{u.name}</p>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.plan === 'Premium' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {u.plan}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                    {u.status === 'active' ? 'Активен' : 'Неактивен'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{u.items}</td>
                            <td className="px-6 py-4 text-gray-600">{u.outfits}</td>
                            <td className="px-6 py-4 text-gray-600">{u.joined}</td>
                            <td className="px-6 py-4">
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                    <div className="icon-more-vertical text-lg text-gray-400"></div>
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

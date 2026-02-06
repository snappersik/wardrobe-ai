import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import UsersTable from '../../components/admin/UsersTable'
import Icon from '../../components/common/Icon'
import api from '../../api/axios'
import Toast from '../../components/common/Toast'

const PAGE_SIZE = 10

const AdminUsersPage = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [users, setUsers] = useState([])
    const [toast, setToast] = useState(null)
    const [cityFilter, setCityFilter] = useState('all')
    const [roleFilter, setRoleFilter] = useState('all')
    const [sortOrder, setSortOrder] = useState('az')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users')
            setUsers(data)
        } catch (error) {
            console.error('Failed to fetch users', error)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, null, {
                params: { role: newRole }
            })
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ))
            setToast({ message: 'Роль успешно обновлена', type: 'success' })
        } catch (error) {
            setToast({ message: 'Ошибка обновления роли', type: 'error' })
        }
    }

    const cityOptions = useMemo(() => {
        const unique = new Set(users.map(u => u.city).filter(Boolean))
        return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ru'))
    }, [users])

    const filteredUsers = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        const fromDate = dateFrom ? new Date(dateFrom) : null
        const toDate = dateTo ? new Date(dateTo) : null
        if (toDate) {
            toDate.setHours(23, 59, 59, 999)
        }

        const filtered = users.filter(u => {
            const name = (u.full_name || '').toLowerCase()
            const username = (u.username || '').toLowerCase()
            const email = (u.email || '').toLowerCase()
            const matchesQuery = !query || name.includes(query) || username.includes(query) || email.includes(query)
            const matchesCity = cityFilter === 'all' || u.city === cityFilter
            const matchesRole = roleFilter === 'all' || u.role === roleFilter

            const createdAt = u.created_at ? new Date(u.created_at) : null
            const matchesFrom = !fromDate || (createdAt && createdAt >= fromDate)
            const matchesTo = !toDate || (createdAt && createdAt <= toDate)

            return matchesQuery && matchesCity && matchesRole && matchesFrom && matchesTo
        })

        const sorted = filtered.sort((a, b) => {
            const nameA = (a.full_name || a.username || '').toLowerCase()
            const nameB = (b.full_name || b.username || '').toLowerCase()
            return sortOrder === 'az'
                ? nameA.localeCompare(nameB, 'ru')
                : nameB.localeCompare(nameA, 'ru')
        })

        return sorted
    }, [users, searchQuery, cityFilter, roleFilter, dateFrom, dateTo, sortOrder])

    useEffect(() => {
        setPage(1)
    }, [searchQuery, cityFilter, roleFilter, dateFrom, dateTo, sortOrder])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
    const safePage = Math.min(page, totalPages)
    const pagedUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    const resetFilters = () => {
        setSearchQuery('')
        setCityFilter('all')
        setRoleFilter('all')
        setSortOrder('az')
        setDateFrom('')
        setDateTo('')
    }

    return (
        <AdminLayout activePage="users">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link to="/admin" className="text-gray-500 hover:text-gray-700">
                        <Icon name="arrow-left" size={22} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
                </div>
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Поиск по email, username, имени..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-white/70 bg-white/80 rounded-xl focus:outline-none focus:border-primary"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon name="search" size={18} />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 border border-white/70 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Icon name="map-pin" size={16} className="text-gray-400" />
                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-700"
                    >
                        <option value="all">Все города</option>
                        {cityOptions.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="users" size={16} className="text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-700"
                    >
                        <option value="all">Все роли</option>
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="calendar" size={16} className="text-gray-400" />
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-700"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-700"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="type" size={16} className="text-gray-400" />
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white border border-gray-100 text-sm text-gray-700"
                    >
                        <option value="az">От А до Я</option>
                        <option value="za">От Я до А</option>
                    </select>
                </div>
                <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-auto px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                    Сбросить
                </button>
            </div>

            <UsersTable
                users={pagedUsers}
                onRoleChange={handleRoleChange}
                onNotify={(message, type = 'success') => setToast({ message, type })}
            />

            {filteredUsers.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-500">
                        Страница {safePage} из {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/70 bg-white/80 text-gray-700 disabled:opacity-40"
                        >
                            Назад
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-white/70 bg-white/80 text-gray-700 disabled:opacity-40"
                        >
                            Вперёд
                        </button>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AdminLayout>
    )
}

export default AdminUsersPage

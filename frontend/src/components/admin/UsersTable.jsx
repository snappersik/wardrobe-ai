import { useEffect, useRef, useState } from 'react'
import Icon from '../common/Icon'
import api from '../../api/axios'

const UsersTable = ({ users, onRoleChange, onNotify }) => {
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)
    const mediaBaseUrl = api.defaults.baseURL.replace('/api', '')

    useEffect(() => {
        if (!openMenuId) return undefined
        const handler = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [openMenuId])

    const copyToClipboard = async (value, label) => {
        if (!value) return
        try {
            await navigator.clipboard.writeText(value)
            onNotify?.(`${label} скопирован`, 'success')
        } catch (error) {
            console.error('Clipboard copy failed', error)
            onNotify?.('Не удалось скопировать', 'error')
        } finally {
            setOpenMenuId(null)
        }
    }

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
                    {users.map(u => {
                        const avatarSrc = u.avatar_path ? `${mediaBaseUrl}/${u.avatar_path}` : null
                        const displayName = u.full_name || u.username
                        return (
                            <tr key={u.id} className="border-b border-white/70 hover:bg-white">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                            {avatarSrc ? (
                                                <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{(u.username || '?')[0].toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{displayName}</p>
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
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative inline-block" ref={openMenuId === u.id ? menuRef : null}>
                                        <button
                                            className="p-2 hover:bg-gray-100 rounded-lg"
                                            onClick={() => setOpenMenuId(prev => (prev === u.id ? null : u.id))}
                                            aria-label="Действия"
                                        >
                                            <Icon name="more-vertical" size={18} className="text-gray-400" />
                                        </button>

                                        {openMenuId === u.id && (
                                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-20">
                                                <button
                                                    onClick={() => copyToClipboard(u.email, 'Email')}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Скопировать email
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(u.username, 'Username')}
                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Скопировать username
                                                </button>
                                                <a
                                                    href={`mailto:${u.email}`}
                                                    className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setOpenMenuId(null)}
                                                >
                                                    Написать письмо
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default UsersTable

// =============================================================================
// АДМИН МАРШРУТ (AdminRoute.jsx)
// =============================================================================
// Компонент-обёртка для защиты админ-маршрутов.
// Требует авторизации И роль admin.
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Защищённый маршрут для администраторов.
 * 
 * Проверяет:
 * 1. Пользователь авторизован
 * 2. У пользователя роль "admin"
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерний компонент (страница)
 * @returns {React.ReactNode}
 * 
 * @example
 * <Route path="/admin" element={
 *     <AdminRoute>
 *         <AdminDashboardPage />
 *     </AdminRoute>
 * } />
 */
const AdminRoute = ({ children }) => {
    // Получаем данные пользователя из контекста авторизации
    const { user, loading } = useAuth()

    // Получаем текущий путь
    const location = useLocation()

    // Пока проверяем авторизацию - ничего не показываем
    if (loading) {
        return null
    }

    // Если пользователь не авторизован - редирект на логин
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Если пользователь не админ - редирект на 403 (Forbidden)
    if (user.role !== 'admin') {
        return <Navigate to="/403" replace />
    }

    // Пользователь авторизован и является админом
    return children
}

export default AdminRoute

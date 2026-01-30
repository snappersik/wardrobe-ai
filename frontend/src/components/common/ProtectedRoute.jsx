// =============================================================================
// ЗАЩИЩЁННЫЙ МАРШРУТ (ProtectedRoute.jsx)
// =============================================================================
// Компонент-обёртка для защиты маршрутов, требующих авторизации.
// Если пользователь не авторизован - редирект на страницу входа.
// =============================================================================

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Защищённый маршрут - требует авторизации пользователя.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерний компонент (страница)
 * @returns {React.ReactNode}
 * 
 * @example
 * <Route path="/profile" element={
 *     <ProtectedRoute>
 *         <ProfilePage />
 *     </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children }) => {
    // Получаем данные пользователя из контекста авторизации
    const { user, loading } = useAuth()

    // Получаем текущий путь для сохранения после входа
    const location = useLocation()

    // Пока проверяем авторизацию - ничего не показываем
    // (AuthProvider уже показывает loading)
    if (loading) {
        return null
    }

    // Если пользователь не авторизован - редирект на логин
    // state={{ from: location }} сохраняет путь для возврата после входа
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Пользователь авторизован - показываем содержимое
    return children
}

export default ProtectedRoute

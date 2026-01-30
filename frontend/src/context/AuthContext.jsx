// =============================================================================
// КОНТЕКСТ АВТОРИЗАЦИИ (AuthContext.jsx)
// =============================================================================
// Этот модуль управляет состоянием авторизации пользователя.
// Использует React Context для глобального доступа к данным пользователя.
// =============================================================================

// React хуки для работы с контекстом и состоянием
import { createContext, useContext, useState, useEffect } from 'react'

// Настроенный axios для API запросов
import api from '../api/axios'

// =============================================================================
// СОЗДАНИЕ КОНТЕКСТА
// =============================================================================
// Контекст позволяет передавать данные через дерево компонентов
// без необходимости передавать props на каждом уровне
const AuthContext = createContext(null)

// =============================================================================
// ПРОВАЙДЕР АВТОРИЗАЦИИ
// =============================================================================
// AuthProvider оборачивает всё приложение и предоставляет:
// - user: данные текущего пользователя (или null)
// - loading: флаг загрузки (для показа спиннера)
// - login: функция входа
// - register: функция регистрации
// - logout: функция выхода
export const AuthProvider = ({ children }) => {
    // Состояние текущего пользователя (null = не авторизован)
    const [user, setUser] = useState(null)

    // Флаг загрузки (true пока проверяем авторизацию)
    const [loading, setLoading] = useState(true)

    // ==========================================================================
    // ПРОВЕРКА АВТОРИЗАЦИИ ПРИ ЗАГРУЗКЕ
    // ==========================================================================
    // При первом рендере проверяем, есть ли у пользователя активная сессия
    useEffect(() => {
        checkAuth()
    }, [])

    /**
     * Проверяет авторизацию пользователя.
     * 
     * Делает запрос GET /api/users/me с cookies.
     * Если токен валиден - получаем данные пользователя.
     * Если токен истёк или отсутствует - получаем 401 ошибку.
     */
    const checkAuth = async () => {
        try {
            // Запрос текущего пользователя (cookie отправляется автоматически)
            const { data } = await api.get('/users/me')
            setUser(data)
        } catch (error) {
            // Пользователь не авторизован (401 или другая ошибка)
            setUser(null)
        } finally {
            // В любом случае убираем загрузку
            setLoading(false)
        }
    }

    /**
     * Авторизация пользователя (вход в систему).
     * 
     * @param {string} username - Логин или email
     * @param {string} password - Пароль
     * @returns {Promise<Object>} - Данные пользователя
     * @throws {Error} - Если логин/пароль неверные
     */
    const login = async (username, password) => {
        try {
            // POST запрос на вход (бекенд установит cookie)
            const { data } = await api.post('/users/login', {
                username_or_email: username,
                password
            })
            // Сохраняем данные пользователя в состояние
            setUser(data)
            return data
        } catch (error) {
            // Пробрасываем ошибку для обработки в компоненте
            throw error
        }
    }

    /**
     * Регистрация нового пользователя.
     * 
     * @param {Object} userData - Данные для регистрации
     * @param {string} userData.username - Логин
     * @param {string} userData.email - Email
     * @param {string} userData.password - Пароль
     * @param {string} [userData.full_name] - Полное имя (опционально)
     * @param {string} [userData.city] - Город (опционально)
     * @returns {Promise<Object>} - Данные созданного пользователя
     */
    const register = async (userData) => {
        try {
            // POST запрос на регистрацию (автоматически авторизует)
            const { data } = await api.post('/users/register', userData)
            // Сохраняем данные пользователя
            setUser(data)
            return data
        } catch (error) {
            throw error
        }
    }

    /**
     * Выход из системы.
     * 
     * Удаляет cookie авторизации и редиректит на страницу входа.
     */
    const logout = async () => {
        try {
            // POST запрос на выход (бекенд удалит cookie)
            await api.post('/users/logout')
            // Очищаем состояние пользователя
            setUser(null)
            // Редирект на страницу входа
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    /**
     * Обновление профиля пользователя.
     * 
     * @param {Object} data - Данные для обновления (username, email, city, etc.)
     */
    const updateProfile = async (data) => {
        try {
            const response = await api.patch('/users/me', data)
            setUser(response.data)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Удаление аккаунта.
     */
    const deleteAccount = async () => {
        try {
            await api.delete('/users/me')
            setUser(null)
            window.location.href = '/login'
        } catch (error) {
            console.error('Failed to delete account', error)
            throw error
        }
    }

    // ==========================================================================
    // РЕНДЕР ПРОВАЙДЕРА
    // ==========================================================================
    return (
        // Предоставляем значения всем дочерним компонентам
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, deleteAccount }}>
            {/* Показываем приложение только после проверки авторизации */}
            {!loading && children}
        </AuthContext.Provider>
    )
}

// =============================================================================
// ХУУК ДЛЯ ИСПОЛЬЗОВАНИЯ КОНТЕКСТА
// =============================================================================
/**
 * Хук для доступа к контексту авторизации.
 * 
 * @returns {Object} - { user, loading, login, register, logout }
 * 
 * @example
 * const { user, logout } = useAuth()
 * if (user) {
 *     console.log(`Hello, ${user.username}!`)
 * }
 */
export const useAuth = () => useContext(AuthContext)

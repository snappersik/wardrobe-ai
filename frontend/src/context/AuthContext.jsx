import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const { data } = await api.get('/users/me')
            setUser(data)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (username, password) => {
        // FormData для OAuth2 совместимости, хотя бэкенд вроде принимает JSON по схеме,
        // но в users.py login принимает schemas.UserLogin
        // Проверим users.py:
        // credentials: schemas.UserLogin -> JSON body
        try {
            const { data } = await api.post('/users/login', { username_or_email: username, password })
            setUser(data)
            return data
        } catch (error) {
            throw error
        }
    }

    const register = async (userData) => {
        try {
            // userData: { username, email, password, full_name, city }
            const { data } = await api.post('/users/register', userData)
            setUser(data)
            return data
        } catch (error) {
            throw error
        }
    }

    const logout = async () => {
        try {
            await api.post('/users/logout')
            setUser(null)
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

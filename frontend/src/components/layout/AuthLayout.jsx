import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CityConfirmPopup from '../common/CityConfirmPopup'
import api from '../../api/axios'

/**
 * AuthLayout - Layout для авторизованных страниц.
 * Запрашивает геолокацию и показывает popup подтверждения города.
 */
const AuthLayout = ({ children }) => {
    const { user, updateProfile } = useAuth()
    const navigate = useNavigate()
    const [showCityPopup, setShowCityPopup] = useState(false)
    const [detectedCity, setDetectedCity] = useState(null)
    const [isDetecting, setIsDetecting] = useState(false)

    // Проверяем нужно ли показать popup города
    useEffect(() => {
        if (user) {
            // Проверяем localStorage, показывали ли popup для этого пользователя
            const cityConfirmed = localStorage.getItem(`city_confirmed_${user.id}`)
            if (!cityConfirmed) {
                // Запускаем определение города
                detectUserCity()
            }
        }
    }, [user])

    /**
     * Определяет город пользователя через геолокацию браузера
     */
    const detectUserCity = async () => {
        setIsDetecting(true)

        // Проверяем поддержку геолокации
        if (!navigator.geolocation) {
            console.log('Geolocation not supported')
            setDetectedCity(user?.city || 'Москва')
            setShowCityPopup(true)
            setIsDetecting(false)
            return
        }

        // Запрашиваем разрешение на геолокацию
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                // Успешно получили координаты
                const { latitude, longitude } = position.coords
                console.log(`📍 Координаты: ${latitude}, ${longitude}`)

                try {
                    // Определяем город по координатам
                    const { data } = await api.get(`/outfits/weather/city-by-coords?lat=${latitude}&lon=${longitude}`)
                    console.log(`🏙️ Город: ${data.city}`)
                    setDetectedCity(data.city)
                } catch (error) {
                    console.error('Failed to get city:', error)
                    setDetectedCity(user?.city || 'Москва')
                }

                setShowCityPopup(true)
                setIsDetecting(false)
            },
            (error) => {
                // Пользователь отклонил или ошибка
                console.log('Geolocation error:', error.message)
                setDetectedCity(user?.city || 'Москва')
                setShowCityPopup(true)
                setIsDetecting(false)
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // Кэш 5 минут
            }
        )
    }

    const handleCityConfirm = async () => {
        // Сохраняем флаг что город подтверждён
        if (user) {
            localStorage.setItem(`city_confirmed_${user.id}`, 'true')

            // Если определённый город отличается от текущего - обновляем профиль
            if (detectedCity && detectedCity !== user.city) {
                try {
                    await updateProfile({ city: detectedCity })
                } catch (error) {
                    console.error('Failed to update city:', error)
                }
            }
        }
        setShowCityPopup(false)
    }

    const handleCityChange = () => {
        // Сохраняем флаг и редиректим в профиль
        if (user) {
            localStorage.setItem(`city_confirmed_${user.id}`, 'true')
        }
        setShowCityPopup(false)
        navigate('/profile')
    }

    return (
        <>
            {children}

            {/* Popup подтверждения города */}
            {showCityPopup && user && !isDetecting && (
                <CityConfirmPopup
                    city={detectedCity || user.city || 'Москва'}
                    onConfirm={handleCityConfirm}
                    onChangeCity={handleCityChange}
                />
            )}
        </>
    )
}

export default AuthLayout

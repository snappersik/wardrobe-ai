import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

/**
 * CityConfirmPopup - Красивая всплывашка для подтверждения города
 * Появляется при первом заходе на сайт
 */
const CityConfirmPopup = ({ city, onConfirm, onChangeCity }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Плавное появление
        const timer = setTimeout(() => setIsVisible(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const handleConfirm = () => {
        setIsVisible(false)
        setTimeout(onConfirm, 300)
    }

    const handleChange = () => {
        setIsVisible(false)
        setTimeout(onChangeCity, 300)
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div className={`relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Weather Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="map-pin" size={36} className="text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                    Ваш город
                </h2>

                {/* City Name */}
                <p className="text-center mb-6">
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        {city || 'Москва'}
                    </span>
                    <span className="text-gray-600 block mt-1">верно?</span>
                </p>

                {/* Description */}
                <p className="text-sm text-gray-500 text-center mb-8">
                    Мы определили ваш город автоматически.<br />
                    Это поможет подбирать одежду по погоде 🌤️
                </p>

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleChange}
                        className="flex-1 px-6 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Изменить
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Да, верно
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CityConfirmPopup

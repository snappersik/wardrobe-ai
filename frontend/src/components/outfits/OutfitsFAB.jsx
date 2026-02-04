// =============================================================================
// КОМПОНЕНТ OutfitsFAB (Floating Action Button для образов)
// =============================================================================
// Плавающая кнопка действия для страницы образов.
// При нажатии открывает меню с выбором: Вручную или AI генератор.
// Проверяет наличие минимального количества вещей в гардеробе.
// =============================================================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../common/Icon'

// Импорт категорий одежды
import clothingCategories from '../../data/clothing-categories.json'

// =============================================================================
// КОМПОНЕНТ FAB ДЛЯ ОБРАЗОВ
// =============================================================================
/**
 * Плавающая кнопка для создания образов.
 * 
 * @param {Array} wardrobeItems - Массив вещей в гардеробе для проверки
 * @param {function} onInsufficientItems - Callback когда не хватает вещей
 */
export default function OutfitsFAB({ wardrobeItems = [], onInsufficientItems }) {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    // Получаем типы категорий
    const getCategoryType = (categoryId) => {
        const cat = clothingCategories.find(c => c.id === categoryId)
        return cat?.type || 'other'
    }

    // Проверка наличия вещей верх/низ
    const checkMinimumItems = () => {
        const hasTop = wardrobeItems.some(item => {
            const type = getCategoryType(item.category)
            return type === 'top' || type === 'full'
        })

        const hasBottom = wardrobeItems.some(item => {
            const type = getCategoryType(item.category)
            return type === 'bottom' || type === 'full'
        })

        return hasTop && hasBottom
    }

    const handleManualClick = () => {
        setIsOpen(false)
        if (checkMinimumItems()) {
            navigate('/outfits/create')
        } else {
            onInsufficientItems?.()
        }
    }

    const handleAIClick = () => {
        setIsOpen(false)
        if (checkMinimumItems()) {
            navigate('/generator')
        } else {
            onInsufficientItems?.()
        }
    }

    return (
        <>
            {/* ============================================================= */}
            {/* BACKDROP */}
            {/* ============================================================= */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* ============================================================= */}
            {/* КОНТЕЙНЕР FAB И МЕНЮ */}
            {/* ============================================================= */}
            <div className="fixed z-50 bottom-24 right-6 md:bottom-10 md:right-10 flex flex-col items-end gap-4 pointer-events-none">

                {/* ПУНКТЫ МЕНЮ */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                    {/* Создать вручную */}
                    <button
                        onClick={handleManualClick}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-gray-700">
                            ✏️ Вручную
                        </span>
                        <div className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg shadow-gray-200 flex items-center justify-center group-hover:bg-gray-50 group-hover:scale-110 transition-all duration-200">
                            <Icon name="hanger" size={20} />
                        </div>
                    </button>

                    {/* AI генератор */}
                    <button
                        onClick={handleAIClick}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-gray-700">
                            ✨ AI Генератор
                        </span>
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-200 flex items-center justify-center group-hover:bg-purple-700 group-hover:scale-110 transition-all duration-200">
                            <Icon name="wand-sparkles" size={20} />
                        </div>
                    </button>
                </div>

                {/* ГЛАВНАЯ КНОПКА FAB */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all duration-300 active:scale-95 ${isOpen ? 'rotate-45 bg-gray-800 hover:bg-gray-900 shadow-gray-300' : ''}`}
                    aria-label="Создать образ"
                >
                    <Icon name="plus" size={28} />
                </button>
            </div>
        </>
    )
}

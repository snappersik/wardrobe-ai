// =============================================================================
// КОМПОНЕНТ WardrobeFAB (Floating Action Button для гардероба)
// =============================================================================
// Плавающая кнопка действия для страницы гардероба.
// При нажатии открывает меню с выбором: Камера или Галерея.
// =============================================================================

import { useState } from 'react'
import Icon from '../common/Icon'

// =============================================================================
// КОМПОНЕНТ FAB ДЛЯ ГАРДЕРОБА
// =============================================================================
/**
 * Плавающая кнопка для добавления вещей в гардероб.
 * 
 * @param {function} onCameraClick - Callback при выборе камеры
 * @param {function} onGalleryClick - Callback при выборе галереи
 */
export default function WardrobeFAB({ onCameraClick, onGalleryClick }) {
    // Состояние меню (открыто/закрыто)
    const [isOpen, setIsOpen] = useState(false)

    const handleCameraClick = () => {
        setIsOpen(false)
        onCameraClick?.()
    }

    const handleGalleryClick = () => {
        setIsOpen(false)
        onGalleryClick?.()
    }

    return (
        <>
            {/* ============================================================= */}
            {/* BACKDROP (затемнение фона при открытом меню) */}
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

                {/* ========================================================= */}
                {/* ПУНКТЫ МЕНЮ */}
                {/* ========================================================= */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                    {/* ----------------------------------------------------- */}
                    {/* ПУНКТ 1: Камера */}
                    {/* ----------------------------------------------------- */}
                    <button
                        onClick={handleCameraClick}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white/95 px-4 py-2 rounded-xl shadow-md border border-gray-100 text-sm font-semibold text-gray-700">
                            Камера
                        </span>
                        <div className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-md border border-gray-100 flex items-center justify-center group-hover:bg-gray-50 group-hover:scale-110 transition-all duration-200">
                            <Icon name="camera" size={20} />
                        </div>
                    </button>

                    {/* ----------------------------------------------------- */}
                    {/* ПУНКТ 2: Галерея */}
                    {/* ----------------------------------------------------- */}
                    <button
                        onClick={handleGalleryClick}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white/95 px-4 py-2 rounded-xl shadow-md border border-gray-100 text-sm font-semibold text-gray-700">
                            Галерея
                        </span>
                        <div className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-md border border-gray-100 flex items-center justify-center group-hover:bg-gray-50 group-hover:scale-110 transition-all duration-200">
                            <Icon name="image" size={20} />
                        </div>
                    </button>
                </div>

                {/* ========================================================= */}
                {/* ГЛАВНАЯ КНОПКА FAB */}
                {/* ========================================================= */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all duration-300 active:scale-95 ${isOpen ? 'rotate-45 bg-gray-800 hover:bg-gray-900 shadow-gray-300' : ''}`}
                    aria-label="Добавить вещь"
                >
                    <Icon name="plus" size={28} />
                </button>
            </div>
        </>
    )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'

export default function FAB() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Backdrop to close menu when clicking outside */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="fixed z-50 bottom-24 right-6 md:bottom-10 md:right-10 flex flex-col items-end gap-4 pointer-events-none">

                {/* Menu Items Container - pointer-events-auto allows clicking buttons */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

                    {/* Manual Creation Option */}
                    <Link
                        to="/outfits/create"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-gray-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                            Вручную
                        </span>
                        <div className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg shadow-gray-200 flex items-center justify-center group-hover:bg-gray-50 group-hover:scale-110 transition-all duration-200">
                            <Icon name="shirt" size={20} />
                        </div>
                    </Link>

                    {/* AI Generation Option */}
                    <Link
                        to="/generator"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 group"
                    >
                        <span className="bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold text-gray-700 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                            AI Генератор
                        </span>
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg shadow-purple-200 flex items-center justify-center group-hover:bg-purple-700 group-hover:scale-110 transition-all duration-200">
                            <Icon name="wand-sparkles" size={20} />
                        </div>
                    </Link>
                </div>

                {/* Main Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`pointer-events-auto w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-pink-200 flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all duration-300 active:scale-95 ${isOpen ? 'rotate-45 bg-gray-800 hover:bg-gray-900 shadow-gray-300' : ''}`}
                    aria-label="Toggle menu"
                >
                    <Icon name="plus" size={28} />
                </button>
            </div>
        </>
    )
}

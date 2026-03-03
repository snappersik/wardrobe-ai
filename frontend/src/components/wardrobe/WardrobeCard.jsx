// =============================================================================
// КАРТОЧКА ВЕЩИ (WardrobeCard.jsx)
// =============================================================================
// Компонент карточки одной вещи в гардеробе.
// Отображает изображение, название и категорию.
// При наведении показываются кнопки редактирования и удаления.
// =============================================================================

import { useState } from 'react'
import Icon from '../common/Icon'
import api from '../../api/axios'

// Категории одежды для отображения русских названий
import clothingCategories from '../../data/clothing-categories.json'

/**
 * Карточка вещи в гардеробе.
 * 
 * @param {Object} item - Данные вещи
 * @param {number} item.id - ID вещи
 * @param {string} item.image_path - Путь к изображению
 * @param {string} item.filename - Имя файла
 * @param {string} item.category - Категория
 * @param {function} onDelete - Callback для удаления вещи
 * @param {function} onEdit - Callback для редактирования вещи
 */
export default function WardrobeCard({ item, onDelete, onEdit }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)

    // Получаем русское название категории
    const getCategoryName = (categoryId) => {
        const cat = clothingCategories.find(c => c.id === categoryId)
        return cat?.name || categoryId || 'Одежда'
    }

    // URL изображения - baseURL содержит /api, но uploads монтирован без /api
    const imageUrl = item.image_path
        ? `${api.defaults.baseURL.replace('/api', '')}/${item.image_path}`
        : item.image || 'https://via.placeholder.com/300x400?text=No+Image'

    // Название вещи
    const itemName = item.name || item.filename || 'Без названия'

    const handleDeleteClick = (e) => {
        e.stopPropagation()
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        setIsDeleting(true)
        await onDelete(item.id)
        setIsDeleting(false)
        setShowDeleteModal(false)
    }

    return (
        <>
            {/* Контейнер карточки с hover-эффектами */}
            <div className="bg-white rounded-2xl p-3 shadow-card border border-gray-100/80 card-hover group relative overflow-hidden">

                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                {/* ИЗОБРАЖЕНИЕ ВЕЩИ */}
                <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-50">
                    {/* Skeleton placeholder while image loads */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 skeleton" />
                    )}
                    <img
                        src={imageUrl}
                        alt={itemName}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'; setImageLoaded(true) }}
                    />

                    {/* КНОПКИ ДЕЙСТВИЙ (появляются при наведении) */}
                    <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                        {/* Кнопка редактирования */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md text-gray-600 hover:text-primary transition-all duration-200"
                        >
                            <Icon name="pencil" size={14} />
                        </button>

                        {/* Кнопка удаления */}
                        <button
                            onClick={handleDeleteClick}
                            className="p-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:bg-white hover:shadow-md text-gray-600 hover:text-red-500 transition-all duration-200"
                        >
                            <Icon name="trash" size={14} />
                        </button>
                    </div>

                    {/* Gradient overlay at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* ИНФОРМАЦИЯ О ВЕЩИ */}
                <div className="relative">
                    {/* Название вещи (обрезается если слишком длинное) */}
                    <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base">{itemName}</h3>
                    {/* Категория вещи */}
                    <p className="text-xs text-gray-400 mt-0.5">{getCategoryName(item.category)}</p>
                </div>
            </div>

            {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ УДАЛЕНИЯ */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
                        {/* Иконка предупреждения */}
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center">
                            <Icon name="trash" size={32} className="text-red-500" />
                        </div>

                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                            Удалить вещь?
                        </h3>
                        <p className="text-gray-500 text-center mb-6 text-sm">
                            Вы уверены, что хотите удалить "{itemName}"? Это действие нельзя отменить.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 btn btn-secondary py-3 rounded-xl"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="flex-1 btn bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl disabled:opacity-50 shadow-lg shadow-red-200/50"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Удаляем...</span>
                                    </div>
                                ) : (
                                    'Удалить'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

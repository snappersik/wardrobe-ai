// =============================================================================
// МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ФОТО (UploadModal.jsx)
// =============================================================================
// Компонент для загрузки фотографий одежды в гардероб.
// Поддерживает drag-and-drop и превью изображения перед загрузкой.
// =============================================================================

// React хуки для работы с состоянием и ссылками
import { useState, useRef } from 'react'

// API клиент для отправки файла на сервер
import api from '../../api/axios'

// =============================================================================
// КОМПОНЕНТ МОДАЛЬНОГО ОКНА
// =============================================================================
/**
 * Модальное окно загрузки фото.
 * 
 * @param {boolean} isOpen - Открыто ли модальное окно
 * @param {function} onClose - Функция закрытия модального окна
 * @param {function} onUploadSuccess - Callback после успешной загрузки
 */
export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    // Выбранный файл
    const [file, setFile] = useState(null)

    // URL для превью изображения
    const [preview, setPreview] = useState(null)

    // Флаг загрузки (для показа спиннера)
    const [loading, setLoading] = useState(false)

    // Ссылка на скрытый input[type="file"]
    const fileInputRef = useRef(null)

    // Если модальное окно закрыто - ничего не рендерим
    if (!isOpen) return null

    /**
     * Обработчик выбора файла.
     * Создаёт превью для отображения выбранного изображения.
     * 
     * @param {Event} e - Событие change от input[type="file"]
     */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            // Создаём URL для превью (blob URL)
            setPreview(URL.createObjectURL(selectedFile))
        }
    }

    /**
     * Отправляет файл на сервер.
     * Использует FormData для multipart/form-data запроса.
     */
    const handleUpload = async () => {
        if (!file) return

        setLoading(true)

        // FormData для отправки файла
        const formData = new FormData()
        formData.append('file', file)

        try {
            // POST /api/clothing/upload с файлом
            await api.post('/clothing/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            // Уведомляем родительский компонент об успешной загрузке
            onUploadSuccess()
            // Закрываем модальное окно
            handleClose()
        } catch (error) {
            console.error('Upload failed', error)
            alert('Не удалось загрузить фото')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Закрывает модальное окно и сбрасывает состояние.
     */
    const handleClose = () => {
        setFile(null)
        setPreview(null)
        onClose()
    }

    // ==========================================================================
    // РЕНДЕР МОДАЛЬНОГО ОКНА
    // ==========================================================================
    return (
        // Overlay (затемнение фона)
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            {/* Модальное окно */}
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">

                {/* Заголовок модального окна */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Добавить вещь</h2>
                    {/* Кнопка закрытия (×) */}
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* ===================================================== */}
                    {/* ЗОНА ЗАГРУЗКИ (Drop Zone) */}
                    {/* ===================================================== */}
                    {/* Клик открывает диалог выбора файла */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${preview ? 'border-primary' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }`}
                    >
                        {preview ? (
                            // Если файл выбран - показываем превью
                            <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                            // Если файл не выбран - показываем инструкции
                            <>
                                {/* Иконка изображения */}
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Нажмите, чтобы загрузить фото</p>
                                <p className="text-gray-400 text-sm mt-1">JPEG, PNG до 5MB</p>
                            </>
                        )}

                        {/* Скрытый input для выбора файла */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* ===================================================== */}
                    {/* КНОПКА ЗАГРУЗКИ */}
                    {/* ===================================================== */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full btn btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            // Спиннер загрузки
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                        ) : (
                            'Загрузить'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

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

    // Флаг загрузки
    const [loading, setLoading] = useState(false)

    // Состояние показа инструкции
    const [showGuide, setShowGuide] = useState(false)

    // Ссылка на скрытый input[type="file"]
    const fileInputRef = useRef(null)

    // Если модальное окно закрыто - ничего не рендерим
    if (!isOpen) return null

    /**
     * Обработчик выбора файла.
     * Создаёт превью для отображения выбранного изображения.
     */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
            setShowGuide(false) // Закрываем гид если файл выбран
        }
    }

    /**
     * Открытие камеры напрямую (на мобильных устройствах)
     */
    const handleCameraClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment')
            fileInputRef.current.click()
        }
    }

    /**
     * Открытие галереи
     */
    const handleGalleryClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.removeAttribute('capture')
            fileInputRef.current.click()
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await api.post('/clothing/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            onUploadSuccess()
            handleClose()
        } catch (error) {
            console.error('Upload failed', error)
            alert('Не удалось загрузить фото')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFile(null)
        setPreview(null)
        setShowGuide(false)
        onClose()
    }

    // Компонент инструкции
    const PhotoGuide = () => (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-800 space-y-2 border border-blue-100">
            <h3 className="font-bold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Как сделать идеальное фото для ИИ:
            </h3>
            <ul className="list-disc list-inside space-y-1 opacity-90">
                <li>Положите вещь на <b>контрастный фон</b> (например, светлую футболку на темный пол)</li>
                <li>Обеспечьте <b>хорошее освещение</b> (лучше дневной свет)</li>
                <li>Расправьте вещь, чтобы не было сильных складок</li>
                <li>В кадре не должно быть других предметов или людей</li>
            </ul>
            <button
                onClick={() => setShowGuide(false)}
                className="mt-2 text-blue-600 font-bold hover:underline"
            >
                Понятно, приступим!
            </button>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Добавить вещь</h2>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Кнопка показа инструкции */}
                    {!preview && !showGuide && (
                        <button
                            onClick={() => setShowGuide(true)}
                            className="w-full flex items-center justify-center text-sm text-primary font-medium p-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            Как правильно сфоткать?
                        </button>
                    )}

                    {showGuide && <PhotoGuide />}

                    <div
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors relative group ${preview ? 'border-primary' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }`}
                    >
                        {preview ? (
                            <div className="relative h-full w-full">
                                <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-4 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Выберите фото вещи</p>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCameraClick(); }}
                                        className="btn btn-outline btn-sm"
                                    >
                                        📷 Камера
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleGalleryClick(); }}
                                        className="btn btn-outline btn-sm"
                                    >
                                        🖼️ Галерея
                                    </button>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <p className="text-xs text-center text-gray-400">
                        {preview ? 'ИИ автоматически распознает вещь и удалит фон' : 'JPEG, PNG до 5MB'}
                    </p>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full btn btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed h-14"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>ИИ обрабатывает фото...</span>
                            </div>
                        ) : (
                            'Добавить в гардероб'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

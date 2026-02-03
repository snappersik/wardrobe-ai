// =============================================================================
// МОДАЛЬНОЕ ОКНО ЗАГРУЗКИ ФОТО (UploadModal.jsx)
// =============================================================================
// Компонент для загрузки фотографий одежды в гардероб.
// Поддерживает drag-and-drop, превью изображения и инструкции.
// =============================================================================

// React хуки для работы с состоянием и ссылками
import { useState, useRef, useEffect } from 'react'

// API клиент для отправки файла на сервер
import api from '../../api/axios'

// Компонент иконок
import Icon from '../common/Icon'

// =============================================================================
// КОМПОНЕНТ МОДАЛЬНОГО ОКНА
// =============================================================================
/**
 * Модальное окно загрузки фото.
 * 
 * @param {boolean} isOpen - Открыто ли модальное окно
 * @param {function} onClose - Функция закрытия модального окна
 * @param {function} onUploadSuccess - Callback после успешной загрузки
 * @param {string} initialMode - Начальный режим: 'gallery' или 'camera'
 */
export default function UploadModal({ isOpen, onClose, onUploadSuccess, initialMode = 'gallery' }) {
    // Выбранный файл
    const [file, setFile] = useState(null)

    // URL для превью изображения
    const [preview, setPreview] = useState(null)

    // Флаг загрузки
    const [loading, setLoading] = useState(false)

    // Состояние показа инструкции
    const [showGuide, setShowGuide] = useState(false)

    // Состояние перетаскивания файла
    const [isDragging, setIsDragging] = useState(false)

    // Ссылка на скрытый input[type="file"]
    const fileInputRef = useRef(null)

    // При открытии с режимом камеры - сразу открываем камеру
    useEffect(() => {
        if (isOpen && initialMode === 'camera' && fileInputRef.current) {
            fileInputRef.current.setAttribute('capture', 'environment')
            setTimeout(() => fileInputRef.current?.click(), 100)
        }
    }, [isOpen, initialMode])

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
            setShowGuide(false)
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

    // ==========================================================================
    // DRAG AND DROP ОБРАБОТЧИКИ
    // ==========================================================================
    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.type.startsWith('image/')) {
            setFile(droppedFile)
            setPreview(URL.createObjectURL(droppedFile))
            setShowGuide(false)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await api.post('/clothing/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            // Передаём данные загруженной вещи в callback для открытия редактора
            onUploadSuccess(response.data)
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
        setIsDragging(false)
        onClose()
    }

    // Компонент инструкции
    const PhotoGuide = () => (
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-800 space-y-2 border border-blue-100">
            <h3 className="font-bold flex items-center">
                <Icon name="info" size={20} className="mr-2" />
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
                        <Icon name="x" size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Кнопка показа инструкции */}
                    {!preview && !showGuide && (
                        <button
                            onClick={() => setShowGuide(true)}
                            className="w-full flex items-center justify-center text-sm text-primary font-medium p-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            <Icon name="info" size={16} className="mr-2" />
                            Как правильно сфоткать?
                        </button>
                    )}

                    {showGuide && <PhotoGuide />}

                    {/* DROPZONE */}
                    <div
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all relative group
                            ${isDragging
                                ? 'border-primary bg-primary/5 scale-[1.02]'
                                : preview
                                    ? 'border-primary'
                                    : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !preview && handleGalleryClick()}
                    >
                        {preview ? (
                            <div className="relative h-full w-full">
                                <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <Icon name="x" size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center p-4 text-center">
                                {isDragging ? (
                                    <>
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 animate-pulse">
                                            <Icon name="download" size={32} />
                                        </div>
                                        <p className="text-primary font-medium">Отпустите файл здесь</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                                            <Icon name="upload" size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium mb-2">Перетащите фото сюда</p>
                                        <p className="text-gray-400 text-sm mb-4">или</p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCameraClick(); }}
                                                className="btn btn-outline btn-sm flex items-center gap-1"
                                            >
                                                <Icon name="camera" size={16} />
                                                Камера
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleGalleryClick(); }}
                                                className="btn btn-outline btn-sm flex items-center gap-1"
                                            >
                                                <Icon name="image" size={16} />
                                                Выбрать файл
                                            </button>
                                        </div>
                                    </>
                                )}
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

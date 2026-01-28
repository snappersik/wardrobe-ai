import { useState, useRef } from 'react'
import api from '../../api/axios'

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)

    if (!isOpen) return null

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setPreview(URL.createObjectURL(selectedFile))
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await api.post('/clothing/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
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
        onClose()
    }

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

                <div className="space-y-6">
                    {/* Upload Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors ${preview ? 'border-primary' : 'border-gray-300 hover:border-primary hover:bg-gray-50'
                            }`}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 font-medium">Нажмите, чтобы загрузить фото</p>
                                <p className="text-gray-400 text-sm mt-1">JPEG, PNG до 5MB</p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full btn btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
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

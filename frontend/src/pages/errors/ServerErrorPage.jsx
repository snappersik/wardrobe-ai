import { Link } from 'react-router-dom'
import Icon from '../../components/common/Icon'

export default function ServerErrorPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="x" className="text-red-500" size={48} />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Внутренняя ошибка сервера</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                    Что-то пошло не так на нашем сервере. Мы уже работаем над устранением проблемы.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6"
                    >
                        Обновить
                    </button>
                    <Link to="/" className="btn btn-primary px-6">
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    )
}

import { Link } from 'react-router-dom'

const ForbiddenPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-9xl font-extrabold text-red-600">403</h1>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Доступ запрещен</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        У вас нет прав для просмотра этой страницы.
                    </p>
                </div>
                <div className="mt-8">
                    <Link to="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ForbiddenPage

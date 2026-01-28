import { Link } from 'react-router-dom'

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h1 className="text-9xl font-extrabold text-blue-600">404</h1>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Страница не найдена</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Извините, мы не смогли найти страницу, которую вы ищете.
                    </p>
                </div>
                <div className="mt-8">
                    <Link to="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default NotFoundPage

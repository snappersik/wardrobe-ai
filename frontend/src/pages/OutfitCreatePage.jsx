import Icon from '../components/common/Icon';
// Страница ручного создания образа (в разработке)
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import { useAuth } from '../context/AuthContext'

export default function OutfitCreatePage() {
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="outfits" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6">
                    <Icon name="shirt" size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Создание образа</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    Страница ручного создания образа находится в разработке.
                    Скоро здесь появится конструктор луков.
                </p>
                <button
                    onClick={() => window.history.back()}
                    className="btn btn-secondary"
                >
                    Вернуться назад
                </button>
            </main>

            <MobileNav activePage="outfits" />
        </div>
    )
}

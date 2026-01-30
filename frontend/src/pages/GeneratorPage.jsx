// AI генератор образов - выбор параметров и генерация outfit
import { useState } from 'react'
import UniversalHeader from '../components/layout/UniversalHeader'
import MobileNav from '../components/layout/MobileNav'
import Icon from '../components/common/Icon';

export default function GeneratorPage() {
    const [occasion, setOccasion] = useState('')       // Выбранный повод
    const [weather, setWeather] = useState('warm')    // Погода
    const [style, setStyle] = useState('casual')      // Стиль
    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState(null)        // Результат генерации

    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: false
    }

    const occasions = [
        { id: 'work', label: 'Работа', icon: 'briefcase' },
        { id: 'casual', label: 'Прогулка', icon: 'coffee' },
        { id: 'party', label: 'Вечеринка', icon: 'sparkles' },
        { id: 'date', label: 'Свидание', icon: 'heart' },
        { id: 'sport', label: 'Спорт', icon: 'dumbbell' },
    ]

    // Имитация генерации образа (заглушка)
    const handleGenerate = () => {
        setGenerating(true)
        setTimeout(() => {
            setResult({
                items: [
                    { name: 'Белая рубашка', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80' },
                    { name: 'Джинсы прямые', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=200&q=80' },
                    { name: 'Кеды белые', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=200&q=80' },
                ]
            })
            setGenerating(false)
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="generator" user={user} />

            <main className="flex-grow container mx-auto max-w-4xl px-4 md:px-6 py-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Генератор образов</h1>
                    <p className="text-gray-500">Выберите параметры и получите идеальный образ</p>
                </div>

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
                    {/* Выбор повода */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">Куда вы собираетесь?</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {occasions.map(occ => (
                                <button
                                    key={occ.id}
                                    onClick={() => setOccasion(occ.id)}
                                    className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${occasion === occ.id
                                        ? 'border-primary bg-pink-50 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon name={occ.icon} size={20} />
                                    <span className="text-sm font-medium">{occ.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Выбор погоды */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">Погода</h3>
                        <div className="flex gap-3">
                            {['cold', 'cool', 'warm', 'hot'].map(w => (
                                <button
                                    key={w}
                                    onClick={() => setWeather(w)}
                                    className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${weather === w
                                        ? 'border-primary bg-pink-50 text-primary'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {w === 'cold' && '❄️ Холодно'}
                                    {w === 'cool' && '🌤️ Прохладно'}
                                    {w === 'warm' && '☀️ Тепло'}
                                    {w === 'hot' && '🔥 Жарко'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={generating || !occasion}
                        className="w-full btn btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                Генерируем образ...
                            </div>
                        ) : (
                            <>
                                <div className="mr-2">
                                    <Icon name="wand-sparkles" size={20} />
                                </div>
                                Создать образ
                            </>
                        )}
                    </button>
                </div>

                {/* Результат генерации */}
                {result && (
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 text-center">Ваш образ готов!</h3>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {result.items.map((item, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-gray-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">{item.name}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 btn btn-outline py-3">Сохранить</button>
                            <button onClick={handleGenerate} className="flex-1 btn btn-primary py-3">Ещё вариант</button>
                        </div>
                    </div>
                )}
            </main>

            <MobileNav activePage="create" />
        </div>
    )
}

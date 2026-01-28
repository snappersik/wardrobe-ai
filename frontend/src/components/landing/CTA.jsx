import { Link } from 'react-router-dom'

export default function CTA() {
    return (
        <section className="py-24">
            <div className="container-custom">
                <div className="bg-black text-white rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-20 blur-[100px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 blur-[100px] rounded-full"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Создай свой первый образ уже сегодня</h2>
                        <p className="text-gray-400 text-lg mb-5">
                            Присоединяйтесь к тысячам пользователей, которые уже доверили свой стиль искусственному интеллекту.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn btn-primary text-lg px-10 py-4">
                                Начать
                            </Link>
                        </div>
                        {/* <p className="mt-6 text-sm text-gray-500">Доступно для iOS и Android</p> */}
                    </div>
                </div>
            </div>
        </section>
    )
}

import { Link } from 'react-router-dom'
import Icon from '../common/Icon'

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-32 md:pb-18 overflow-hidden">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

                    <div className="w-full md:w-1/2 flex flex-col items-start text-left z-10">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-pink-50 text-primary text-sm font-semibold mb-6">
                            ✨ Искусственный интеллект для твоего стиля
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                            Твой гардероб <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                                с нейросетью
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                            Забудь о проблеме «нечего надеть». Наше приложение анализирует твою одежду и создает стильные образы на каждый день за секунды.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Link to="/register" className="btn btn-primary text-lg">
                                Начать бесплатно
                            </Link>
                            <button className="btn bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 flex items-center gap-2">
                                <Icon name="circle-play" className="text-xl" size={24} />
                                Смотреть демо
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64" alt="User" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                                    <img src="https://otvet.imgsmail.ru/download/273877053_7e9bd138d17c261ac3bbc5b91369c349.jpg" alt="User" />
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 overflow-hidden">
                                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShSC4f43BeBC0nUlBN5W2WyWTws1kd2dP-JQ&s" alt="User" />
                                </div>
                            </div>
                            <p>Уже используют более 10,000 модниц</p>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 relative">
                        <div className="relative z-10 bg-surface rounded-3xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                                alt="Wardrobe Showcase"
                                className="w-full h-[500px] object-cover"
                            />

                            {/* Floating Element 1 */}
                            <div
                                className="absolute top-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg max-w-[180px]"
                                style={{
                                    animation: 'floatPulse 4s ease-in-out infinite',
                                }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Icon name="check" className="text-green-600" size={16} />
                                    </div>
                                    <span className="text-sm font-bold">Образ готов!</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-full"></div>
                                </div>
                            </div>

                            {/* Floating Element 2 */}
                            <div
                                className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-4"
                                style={{
                                    animation: 'floatPulse 4s ease-in-out infinite',
                                    animationDelay: '2s',
                                }}
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">
                                    <Icon name="wand-sparkles" size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">AI Assistant</p>
                                    <p className="font-medium text-sm">Подбираю аксессуары...</p>
                                </div>
                            </div>

                            {/* CSS Animation */}
                            <style>{`
                                @keyframes floatPulse {
                                    0%, 100% { opacity: 1; transform: translateY(0); }
                                    50% { opacity: 0.5; transform: translateY(-5px); }
                                }
                            `}</style>
                        </div>

                        {/* Background Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-pink-100/50 rounded-full blur-3xl -z-10"></div>
                    </div>

                </div>
            </div>
        </section>
    )
}

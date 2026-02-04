import Icon from '../common/Icon'

export default function Features() {
    const features = [
        {
            icon: 'sparkles',
            title: 'Генерация образов AI',
            description: 'Умные алгоритмы создают идеальные комбинации из вашей одежды для любой погоды и повода.',
        },
        {
            icon: 'layout-grid',
            title: 'Организация гардероба',
            description: 'Все ваши вещи в одном месте. Сортируйте по сезонам, цветам и категориям в пару кликов.',
        },
        {
            icon: 'hanger',
            title: 'Персональные рекомендации',
            description: 'Получайте советы, что докупить, чтобы максимально разнообразить ваши образы.',
        }
    ]

    return (
        <section id="features" className="section-padding bg-white">
            <div className="container-custom">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Больше, чем просто шкаф</h2>
                    <p className="text-gray-600 text-lg">Мы превращаем хаос в гармонию, используя передовые технологии для вашего стиля.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-surface p-8 rounded-3xl hover:shadow-xl transition-shadow duration-300 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Icon name={feature.icon} className="text-primary" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

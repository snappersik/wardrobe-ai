import Icon from '../common/Icon';

export default function HowItWorks() {
    const steps = [
        {
            num: '01',
            title: 'Загрузите фото',
            desc: 'Сфотографируйте свои вещи. Наш AI автоматически удалит фон и определит категорию.'
        },
        {
            num: '02',
            title: 'Получите образы',
            desc: 'Каждое утро получайте готовые варианты нарядов с учетом погоды за окном.'
        },
        {
            num: '03',
            title: 'Планируйте стиль',
            desc: 'Добавляйте образы в календарь, чтобы всегда знать, что надеть завтра.'
        }
    ]

    return (
        <section id="how-it-works" className="section-padding">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Как это работает?</h2>
                        <p className="text-gray-600 text-lg mb-12">Всего три простых шага отделяют вас от идеального порядка в гардеробе и ежедневного вдохновения.</p>

                        <div className="space-y-10">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold text-lg">
                                        {step.num}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                        <p className="text-gray-600">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 pl-0 md:pl-12">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-[2rem] -z-10 transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                                alt="How it works"
                                className="rounded-2xl shadow-lg w-full h-auto object-cover aspect-[4/5]"
                            />

                            {/* Floating UI Card */}
                            <div className="absolute bottom-8 -left-8 bg-white p-4 rounded-xl shadow-xl w-64 hidden sm:block">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-gray-400">СЕГОДНЯ</span>
                                    <Icon name="cloud-sun" size={16} className="text-yellow-500" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://ae04.alicdn.com/kf/Sd01fd16c54a142c69026651bf7bc6429C.jpg_640x640.jpg)' }}></div>
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt2Lp4YH2Myc3SPmcIBYYFKyZ1PMEIC7S1lA&s)' }}></div>
                                    <div className="w-16 h-20 bg-gray-100 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://imageproxy.fh.by/I7wUeZKwpn_V1O4mmqzsHqe1-XZ9JxVOzZLvN9NUt7M/w:894/h:1342/rt:fit/q:95/czM6Ly9maC1wcm9kdWN0aW9uLXJmMy8xNDUxMjA5LzhjMmY3ZjhlLWQ3MzEtMTFmMC1iNWFkLTAwNTA1NjAxMDI4OA.jpg)' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

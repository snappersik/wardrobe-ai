import Icon from '../common/Icon';

// Брендинг для страниц входа/регистрации (левая панель)
export default function LoginBranding() {
    return (
        <div className="h-full w-full relative flex flex-col">
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2070&auto=format&fit=crop"
                    alt="Fashion Background"
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col h-full text-white justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                        <Icon name="shirt" size={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Умный Гардероб</span>
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                        Твой гардероб <br />
                        с искусственным <br />
                        интеллектом
                    </h2>
                    <p className="text-white/80 max-w-sm text-lg">
                        Создавайте стильные образы за секунды и организуйте свой гардероб легко.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SocialLogin() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 text-gray-700 font-medium">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/58/Yandex_icon.svg" alt="Yandex" className="w-5 h-5" />
                <span className="text-sm">Яндекс</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-full hover:bg-pink-50 hover:border-pink-200 transition-all duration-300 text-gray-700 font-medium">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/VK_Compact_Logo_%282021-present%29.svg" alt="VK" className="w-5 h-5" />
                <span className="text-sm">ВКонтакте</span>
            </button>
        </div>
    )
}

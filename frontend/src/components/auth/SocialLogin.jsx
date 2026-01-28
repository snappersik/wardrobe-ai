export default function SocialLogin() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <button type="button" className="btn btn-outline flex items-center gap-2 py-3 hover:bg-gray-50 transition-colors">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                <span className="text-sm font-medium">Google</span>
            </button>
            <button type="button" className="btn btn-outline flex items-center gap-2 py-3 hover:bg-gray-50 transition-colors">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f3/VK_Compact_Logo_%282021-present%29.svg" alt="VK" className="w-5 h-5" />
                <span className="text-sm font-medium">VK ID</span>
            </button>
        </div>
    )
}

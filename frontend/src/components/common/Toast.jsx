export default function Toast({ message, type = 'success', onClose }) {
    const bgColor = type === 'success' ? 'bg-black' : 'bg-red-500'
    const icon = type === 'success' ? 'check' : 'alert-circle'

    return (
        <div className="fixed top-6 right-6 z-50 animate-bounce-in">
            <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px]`}>
                <div className={`icon-${icon} w-5 h-5`}></div>
                <p className="font-medium">{message}</p>
                <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
                    <div className="icon-x w-4 h-4"></div>
                </button>
            </div>
        </div>
    )
}

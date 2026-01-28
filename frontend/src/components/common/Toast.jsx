import Icon from './Icon'

export default function Toast({ message, type = 'success', onClose }) {
    const bgColor = type === 'success' ? 'bg-black' : 'bg-red-500'
    const iconName = type === 'success' ? 'check' : 'x' // 'alert-circle' mapped to 'x' or verify Icon.jsx

    return (
        <div className="fixed top-6 right-6 z-50 animate-bounce-in">
            <div className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px]`}>
                <Icon name={iconName} className="text-white" size={20} />
                <p className="font-medium">{message}</p>
                <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">
                    <Icon name="x" className="text-white" size={16} />
                </button>
            </div>
        </div>
    )
}

export default function InputGroup({ label, name, type = "text", icon, placeholder, value, onChange, error }) {
    const inputClassName = `w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${error ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-primary'
        }`

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                <div className={`icon-${icon} absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`}></div>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={inputClassName}
                />
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
        </div>
    )
}

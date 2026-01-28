const StatCard = ({ label, value, icon, color }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
                <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                    <div className={`icon-${icon} text-xl`}></div>
                </div>
                <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;

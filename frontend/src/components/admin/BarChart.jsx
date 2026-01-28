const BarChart = ({ data, title, colorFrom, colorTo, footer }) => {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">{title}</h3>
            <div className="h-48 flex items-end justify-between gap-2">
                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        {item.showValue && (
                            <span className="text-xs font-medium text-gray-900">{item.value}</span>
                        )}
                        <div
                            className={`w-full bg-gradient-to-t ${colorFrom} ${colorTo} rounded-t-lg transition-all duration-500 hover:opacity-80`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                ))}
            </div>
            {footer && (
                <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{footer.left}</span>
                    <span className={`${footer.rightColor} font-medium`}>{footer.right}</span>
                </div>
            )}
        </div>
    );
};

export default BarChart;

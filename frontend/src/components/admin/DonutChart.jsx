const DonutChart = ({ data, title, centerValue, centerLabel }) => {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6">{title}</h3>
            <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        {data.reduce((acc, item, idx) => {
                            const prevOffset = acc.offset;
                            const dashArray = item.value;
                            acc.elements.push(
                                <circle
                                    key={idx}
                                    cx="18"
                                    cy="18"
                                    r="15.5"
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="5"
                                    strokeDasharray={`${dashArray} ${100 - dashArray}`}
                                    strokeDashoffset={-prevOffset}
                                    className="transition-all duration-500"
                                />
                            );
                            acc.offset += dashArray;
                            return acc;
                        }, { elements: [], offset: 0 }).elements}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{centerValue}</p>
                            <p className="text-xs text-gray-500">{centerLabel}</p>
                        </div>
                    </div>
                </div>
                {/* Legend */}
                <div className="flex-1 space-y-3">
                    {data.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DonutChart;

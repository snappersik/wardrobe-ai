function DashboardMetrics({ loading }) {
  const metrics = [
    {
      title: 'Всего пользователей',
      value: '12,450',
      change: '+12%',
      trend: 'up',
      icon: 'users',
      color: 'bg-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: 'Активные сегодня',
      value: '1,203',
      change: '+5.2%',
      trend: 'up',
      icon: 'activity',
      color: 'bg-green-500',
      bg: 'bg-green-50'
    },
    {
      title: 'Создано образов',
      value: '45.2k',
      change: '+8%',
      trend: 'up',
      icon: 'layers',
      color: 'bg-[var(--primary-color)]',
      bg: 'bg-pink-50'
    },
    {
      title: 'Загружено вещей',
      value: '89.1k',
      change: '-2.1%',
      trend: 'down',
      icon: 'shirt',
      color: 'bg-purple-500',
      bg: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" data-name="DashboardMetrics" data-file="components/admin/DashboardMetrics.js">
            {[1,2,3,4].map(i => (
                <div key={i} className="card h-32 animate-pulse bg-gray-100"></div>
            ))}
        </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((item, idx) => (
        <div key={idx} className="card flex items-start justify-between relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-gray-500 text-sm font-medium mb-1">{item.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.value}</h3>
                
                <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-500'
                }`}>
                    <div className={`icon-${item.trend === 'up' ? 'trending-up' : 'trending-down'} w-4 h-4`}></div>
                    <span>{item.change}</span>
                    <span className="text-gray-400 font-normal ml-1">vs прошлый период</span>
                </div>
            </div>
            
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${item.color}`}>
                <div className={`icon-${item.icon} w-6 h-6`}></div>
            </div>

            {/* Decoration */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-20 ${item.color}`}></div>
        </div>
      ))}
    </div>
  );
}

window.DashboardMetrics = DashboardMetrics;
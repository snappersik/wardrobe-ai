function DashboardCharts({ type, loading }) {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  React.useEffect(() => {
    // Check for window.ChartJS existence
    if (loading || !chartRef.current || !window.ChartJS) return;

    try {
        // Destroy previous instance if exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#ff91af';

        if (type === 'registrations') {
            chartInstance.current = new window.ChartJS(ctx, {
                type: 'line',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Новые пользователи',
                        data: [65, 59, 80, 81, 56, 120, 145],
                        borderColor: primaryColor,
                        backgroundColor: (context) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                            gradient.addColorStop(0, primaryColor + '40'); // 40 hex is approx 25% opacity
                            gradient.addColorStop(1, primaryColor + '00');
                            return gradient;
                        },
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: primaryColor,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            padding: 10,
                            cornerRadius: 8,
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { borderDash: [4, 4], color: '#f0f0f0' },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            border: { display: false }
                        }
                    }
                }
            });
        } else {
            chartInstance.current = new window.ChartJS(ctx, {
                type: 'bar',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Сгенерировано образов',
                        data: [120, 190, 150, 220, 180, 250, 310],
                        backgroundColor: '#8b5cf6', // Violet-500
                        borderRadius: 6,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { borderDash: [4, 4], color: '#f0f0f0' },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            border: { display: false }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Chart init error:', error);
    }

    return () => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
    };
  }, [loading, type]);

  if (loading) {
      return (
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-xl animate-pulse">
              <div className="icon-chart-bar text-gray-300 w-12 h-12"></div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full" data-name="DashboardCharts" data-file="components/admin/DashboardCharts.js">
      <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">
              {type === 'registrations' ? 'Рост аудитории' : 'Активность генератора'}
          </h3>
          <button className="text-gray-400 hover:text-[var(--primary-color)] transition-colors">
              <div className="icon-ellipsis w-5 h-5"></div>
          </button>
      </div>
      <div className="flex-grow min-h-[300px]">
          <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}

window.DashboardCharts = DashboardCharts;
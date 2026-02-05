class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка загрузки панели</h1>
            <p className="text-gray-500 mb-4">Пожалуйста, обновите страницу</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 transition"
            >
              Обновить
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AdminApp() {
  const [dateRange, setDateRange] = React.useState('7days');
  const [isLoading, setIsLoading] = React.useState(true);

  // Explicitly reference global components
  const AdminLayout = window.AdminLayout;
  const DashboardMetrics = window.DashboardMetrics;
  const DashboardCharts = window.DashboardCharts;
  const ActivityLog = window.ActivityLog;
  const QuickActions = window.QuickActions;

  // Simulate initial data loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!AdminLayout) return null;

  return (
    <div data-name="AdminApp" data-file="admin-app.js">
      <AdminLayout activePage="dashboard">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
            
            <div className="relative">
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-[var(--primary-color)] cursor-pointer text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <option value="today">Сегодня</option>
                    <option value="7days">За последние 7 дней</option>
                    <option value="30days">За последние 30 дней</option>
                    <option value="year">За год</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <div className="icon-chevron-down w-4 h-4"></div>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-6">
            {DashboardMetrics && <DashboardMetrics loading={isLoading} />}
            
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="card h-full">
                    {DashboardCharts && <DashboardCharts type="registrations" loading={isLoading} />}
                </div>
                <div className="card h-full">
                    {DashboardCharts && <DashboardCharts type="activity" loading={isLoading} />}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {ActivityLog && <ActivityLog loading={isLoading} />}
                </div>
                <div className="lg:col-span-1">
                    {QuickActions && <QuickActions loading={isLoading} />}
                </div>
            </div>
        </div>

      </AdminLayout>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AdminApp />
  </ErrorBoundary>
);
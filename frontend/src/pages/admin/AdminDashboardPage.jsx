import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import StatCard from '../../components/admin/StatCard';
import BarChart from '../../components/admin/BarChart';
import DonutChart from '../../components/admin/DonutChart';
import QuickActions from '../../components/admin/QuickActions';

const AdminDashboardPage = () => {
    const user = {
        name: 'Анна Петрова',
        email: 'anna@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        isAdmin: true
    };

    const stats = [
        { label: 'Всего пользователей', value: '12,345', icon: 'users', color: 'bg-blue-500' },
        { label: 'Активных сегодня', value: '1,234', icon: 'activity', color: 'bg-green-500' },
        { label: 'Новых за неделю', value: '567', icon: 'user-plus', color: 'bg-purple-500' },
        { label: 'Образов создано', value: '45,678', icon: 'layers', color: 'bg-pink-500' },
    ];

    const userGrowthData = [
        { label: 'Авг', value: 65 },
        { label: 'Сен', value: 72 },
        { label: 'Окт', value: 78 },
        { label: 'Ноя', value: 85 },
        { label: 'Дек', value: 92 },
        { label: 'Янв', value: 100 },
    ];

    const outfitsByCategory = [
        { label: 'Повседневные', value: 45, color: '#ff91af' },
        { label: 'Деловые', value: 25, color: '#8b5cf6' },
        { label: 'Спортивные', value: 15, color: '#10b981' },
        { label: 'Вечерние', value: 15, color: '#f59e0b' },
    ];

    const weeklyActivity = [
        { label: 'Пн', value: 120, showValue: true },
        { label: 'Вт', value: 150, showValue: true },
        { label: 'Ср', value: 180, showValue: true },
        { label: 'Чт', value: 140, showValue: true },
        { label: 'Пт', value: 200, showValue: true },
        { label: 'Сб', value: 250, showValue: true },
        { label: 'Вс', value: 190, showValue: true },
    ];

    const quickActions = [
        { icon: 'mail', label: 'Рассылка' },
        { icon: 'settings', label: 'Настройки' },
        { icon: 'database', label: 'База данных' },
        { icon: 'pencil', label: 'Редактор', to: '/admin/editor' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <UniversalHeader activePage="admin" user={user} />

            <main className="flex-grow container mx-auto max-w-7xl px-4 md:px-6 py-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Панель администратора</h1>
                    <div className="flex gap-3">
                        <Link to="/admin/users" className="btn btn-outline px-4 py-2">
                            <div className="icon-users text-lg mr-2"></div>
                            Пользователи
                        </Link>
                        <Link to="/admin/logs" className="btn btn-outline px-4 py-2">
                            <div className="icon-file-text text-lg mr-2"></div>
                            Логи
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, idx) => (
                        <StatCard key={idx} {...stat} />
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <BarChart
                        data={userGrowthData}
                        title="Рост пользователей"
                        colorFrom="from-primary"
                        colorTo="to-pink-300"
                        footer={{
                            left: '+35% за полгода',
                            right: '↑ 12,345 пользователей',
                            rightColor: 'text-green-600'
                        }}
                    />
                    <QuickActions actions={quickActions} />
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <DonutChart
                        data={outfitsByCategory}
                        title="Образы по категориям"
                        centerValue="45.6K"
                        centerLabel="образов"
                    />
                    <BarChart
                        data={weeklyActivity}
                        title="Активность по дням"
                        colorFrom="from-violet-500"
                        colorTo="to-purple-300"
                        footer={{
                            left: 'Среднее: 176 действий/день',
                            right: 'Пик: Суббота',
                            rightColor: 'text-purple-600'
                        }}
                    />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardPage;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UniversalHeader from '../../components/layout/UniversalHeader';
import StatCard from '../../components/admin/StatCard';
import BarChart from '../../components/admin/BarChart';
import DonutChart from '../../components/admin/DonutChart';
import QuickActions from '../../components/admin/QuickActions';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        total_users: 0,
        total_items: 0,
        total_outfits: 0,
        recent_logs: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStats();
        }
    }, [user]);

    const stats = [
        { label: 'Всего пользователей', value: dashboardData.total_users, icon: 'users', color: 'bg-blue-500' },
        { label: 'Логи за 24ч', value: dashboardData.recent_logs, icon: 'activity', color: 'bg-green-500' },
        { label: 'Вещей в базе', value: dashboardData.total_items, icon: 'layers', color: 'bg-purple-500' },
        { label: 'Образов создано', value: dashboardData.total_outfits, icon: 'layout', color: 'bg-pink-500' },
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

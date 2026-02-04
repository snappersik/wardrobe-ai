// =============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ (App.jsx)
// =============================================================================
// Корневой компонент React приложения.
// Определяет маршрутизацию (routing) для всех страниц.
// =============================================================================

// React Router - библиотека для маршрутизации в SPA (Single Page Application)
import { Routes, Route } from 'react-router-dom'

// ErrorBoundary - компонент для перехвата ошибок и отображения fallback UI
import ErrorBoundary from './components/common/ErrorBoundary'

// Компоненты защиты маршрутов
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'

// =============================================================================
// ИМПОРТ СТРАНИЦ (Pages)
// =============================================================================

// Публичные страницы (доступны без авторизации)
import HomePage from './pages/HomePage'           // Главная страница (лендинг)
import LoginPage from './pages/LoginPage'         // Страница входа
import RegisterPage from './pages/RegisterPage'   // Страница регистрации

// Страницы гардероба (требуют авторизации пользователя)
import WardrobePage from './pages/WardrobePage'       // Мой гардероб (список вещей)
import OutfitsPage from './pages/OutfitsPage'         // Мои образы (наряды)
import OutfitCreatePage from './pages/OutfitCreatePage' // Создание образа вручную
import OutfitDetailPage from './pages/OutfitDetailPage' // Детали образа
import GeneratorPage from './pages/GeneratorPage'     // AI генератор образов
import CalendarPage from './pages/CalendarPage'       // Календарь нарядов
import ProfilePage from './pages/ProfilePage'         // Профиль пользователя

// Layout для авторизованных страниц (с popup города)
import AuthLayout from './components/layout/AuthLayout'

// Админ-панель (требуют роль admin)
import AdminDashboardPage from './pages/admin/AdminDashboardPage' // Дашборд админа
import AdminUsersPage from './pages/admin/AdminUsersPage'         // Управление пользователями
import AdminLogsPage from './pages/admin/AdminLogsPage'           // Просмотр логов аудита
import AdminEditorPage from './pages/admin/AdminEditorPage'       // Редактор контента

// Страницы ошибок (HTTP status codes)
import NotFoundPage from './pages/errors/NotFoundPage'             // 404 - Страница не найдена
import ForbiddenPage from './pages/errors/ForbiddenPage'           // 403 - Доступ запрещён
import ServerErrorPage from './pages/errors/ServerErrorPage'       // 500 - Ошибка сервера
import TooManyRequestsPage from './pages/errors/TooManyRequestsPage' // 429 - Слишком много запросов

// =============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// =============================================================================
export default function App() {
    return (
        // ErrorBoundary оборачивает всё приложение для перехвата ошибок
        <ErrorBoundary>
            {/* Routes - контейнер для всех маршрутов */}
            <Routes>
                {/* ============================================= */}
                {/* ПУБЛИЧНЫЕ МАРШРУТЫ */}
                {/* ============================================= */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* ============================================= */}
                {/* ЗАЩИЩЁННЫЕ МАРШРУТЫ (требуют авторизации) */}
                {/* AuthLayout добавляет popup подтверждения города */}
                {/* ============================================= */}
                <Route path="/wardrobe" element={<ProtectedRoute><AuthLayout><WardrobePage /></AuthLayout></ProtectedRoute>} />
                <Route path="/outfits" element={<ProtectedRoute><AuthLayout><OutfitsPage /></AuthLayout></ProtectedRoute>} />
                <Route path="/outfits/create" element={<ProtectedRoute><AuthLayout><OutfitCreatePage /></AuthLayout></ProtectedRoute>} />
                <Route path="/outfits/:outfitId" element={<ProtectedRoute><AuthLayout><OutfitDetailPage /></AuthLayout></ProtectedRoute>} />
                <Route path="/generator" element={<ProtectedRoute><AuthLayout><GeneratorPage /></AuthLayout></ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute><AuthLayout><CalendarPage /></AuthLayout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><AuthLayout><ProfilePage /></AuthLayout></ProtectedRoute>} />

                {/* ============================================= */}
                {/* АДМИН МАРШРУТЫ (требуют роль admin) */}
                {/* ============================================= */}
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/logs" element={<AdminRoute><AdminLogsPage /></AdminRoute>} />
                <Route path="/admin/editor" element={<AdminRoute><AdminEditorPage /></AdminRoute>} />

                {/* ============================================= */}
                {/* СТРАНИЦЫ ОШИБОК */}
                {/* ============================================= */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/429" element={<TooManyRequestsPage />} />
                <Route path="/500" element={<ServerErrorPage />} />

                {/* Любой несуществующий маршрут -> 404 */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </ErrorBoundary>
    )
}

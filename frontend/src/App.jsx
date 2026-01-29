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
import GeneratorPage from './pages/GeneratorPage'     // AI генератор образов
import CalendarPage from './pages/CalendarPage'       // Календарь нарядов
import ProfilePage from './pages/ProfilePage'         // Профиль пользователя

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
                {/* ============================================= */}
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/outfits" element={<OutfitsPage />} />
                <Route path="/outfits/create" element={<OutfitCreatePage />} />
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* ============================================= */}
                {/* АДМИН МАРШРУТЫ (требуют роль admin) */}
                {/* ============================================= */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/editor" element={<AdminEditorPage />} />

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

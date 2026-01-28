import { Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/common/ErrorBoundary'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import WardrobePage from './pages/WardrobePage'
import OutfitsPage from './pages/OutfitsPage'
import GeneratorPage from './pages/GeneratorPage'
import CalendarPage from './pages/CalendarPage'
import ProfilePage from './pages/ProfilePage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminLogsPage from './pages/admin/AdminLogsPage'
import AdminEditorPage from './pages/admin/AdminEditorPage'

export default function App() {
    return (
        <ErrorBoundary>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/wardrobe" element={<WardrobePage />} />
                <Route path="/outfits" element={<OutfitsPage />} />
                <Route path="/generator" element={<GeneratorPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/editor" element={<AdminEditorPage />} />
            </Routes>
        </ErrorBoundary>
    )
}

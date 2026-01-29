// =============================================================================
// ТОЧКА ВХОДА ПРИЛОЖЕНИЯ (main.jsx)
// =============================================================================
// Этот файл инициализирует React приложение.
// Настраивает провайдеры: BrowserRouter для маршрутизации, AuthProvider для авторизации.
// =============================================================================

// StrictMode помогает находить потенциальные проблемы в приложении
import { StrictMode } from 'react'

// createRoot - новый API для рендеринга в React 18+
import { createRoot } from 'react-dom/client'

// BrowserRouter обеспечивает маршрутизацию через History API
import { BrowserRouter } from 'react-router-dom'

// Главный компонент приложения
import App from './App'

// Глобальные стили
import './styles/index.css'

// Провайдер авторизации (контекст с данными пользователя)
import { AuthProvider } from './context/AuthContext'

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ И РЕНДЕРИНГ
// =============================================================================
// Получаем корневой DOM элемент и рендерим приложение
createRoot(document.getElementById('root')).render(
    // StrictMode активирует дополнительные проверки и предупреждения в development
    <StrictMode>
        {/* BrowserRouter - обязателен для работы React Router */}
        <BrowserRouter>
            {/* AuthProvider - предоставляет контекст авторизации всему приложению */}
            <AuthProvider>
                {/* Контейнер на всю высоту экрана */}
                <div style={{ minHeight: '100vh' }}>
                    {/* Главный компонент с маршрутами */}
                    <App />
                </div>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
)

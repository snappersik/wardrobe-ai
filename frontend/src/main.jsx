import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <div style={{ minHeight: '100vh' }}>
                    <App />
                </div>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
)

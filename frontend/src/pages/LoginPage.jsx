import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginBranding from '../components/auth/LoginBranding'
import LoginForm from '../components/auth/LoginForm'
import Toast from '../components/common/Toast'
import Icon from '../components/common/Icon'

export default function LoginPage() {
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gray-50 relative">
            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-6 left-6 p-2 rounded-xl bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
                <Icon name="arrow-left" size={20} />
                <span className="text-sm font-medium hidden sm:inline">На главную</span>
            </Link>

            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side: Branding */}
                <div className="w-full md:w-1/2 bg-gray-50 relative overflow-hidden">
                    <LoginBranding />
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <LoginForm showToast={showToast} />
                </div>

            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

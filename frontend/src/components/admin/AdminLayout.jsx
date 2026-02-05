import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout({ children, activePage = 'dashboard' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="admin-scope min-h-screen bg-[#eef3ff] flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activePage={activePage}
            />

            <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300">
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-6 lg:p-6 overflow-x-hidden">
                    {children}
                </main>

                <footer className="px-6 md:px-8 py-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Smart Wardrobe Admin Panel
                </footer>
            </div>
        </div>
    )
}

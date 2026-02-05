function AdminSidebar({ isOpen, onClose, activePage = 'dashboard' }) {
  const menuItems = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', href: 'admin.html' },
    { id: 'editor', icon: 'pen-tool', label: 'Редактор', href: 'admin-editor.html' },
    { id: 'users', icon: 'users', label: 'Пользователи', href: 'admin-users.html' },
    { id: 'analytics', icon: 'chart-bar', label: 'Аналитика', href: '#' },
    { id: 'wardrobes', icon: 'shirt', label: 'Гардеробы', href: '#' },
    { id: 'logs', icon: 'file-text', label: 'Логи', href: 'admin-logs.html' },
    { id: 'settings', icon: 'settings', label: 'Настройки', href: '#' },
  ];

  return (
    <aside 
        className={`fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-name="AdminSidebar" 
        data-file="components/admin/AdminSidebar.js"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-50">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-white shadow-sm">
                    <div className="icon-shirt w-5 h-5"></div>
                </div>
                <div>
                    <span className="font-bold text-lg tracking-tight block leading-none">Умный</span>
                    <span className="font-bold text-lg tracking-tight block leading-none text-[var(--primary-color)]">Гардероб</span>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="lg:hidden ml-auto p-2 text-gray-400 hover:text-gray-600"
            >
                <div className="icon-x w-5 h-5"></div>
            </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
                <a 
                    key={item.id} 
                    href={item.href} 
                    className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                >
                    <div className={`icon-${item.icon} w-5 h-5`}></div>
                    <span className="font-medium">{item.label}</span>
                </a>
            ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-50">
            <a href="index.html" className="nav-item text-red-500 hover:bg-red-50 hover:text-red-600 mb-2">
                <div className="icon-log-out w-5 h-5"></div>
                <span className="font-medium">Выход</span>
            </a>
            
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="icon-zap text-yellow-500 w-5 h-5 fill-current"></div>
                    <span className="font-bold text-sm">Pro Статус</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Система работает стабильно. Нагрузка 24%</p>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[24%] rounded-full"></div>
                </div>
            </div>
        </div>
      </div>
    </aside>
  );
}

window.AdminSidebar = AdminSidebar;
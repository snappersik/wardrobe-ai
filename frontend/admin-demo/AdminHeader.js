function AdminHeader({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-8 py-3" data-name="AdminHeader" data-file="components/admin/AdminHeader.js">
      <div className="flex items-center justify-between h-14">
        
        <div className="flex items-center gap-4">
            <button 
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <div className="icon-menu w-6 h-6"></div>
            </button>


        </div>

        <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="icon-bell w-5 h-5"></div>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-gray-900">Администратор</div>
                    <div className="text-xs text-gray-500">Super Admin</div>
                </div>
                <button className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-[var(--primary-color)] hover:ring-offset-2 transition-all">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" alt="Admin" />
                </button>
            </div>
        </div>

      </div>
    </header>
  );
}

window.AdminHeader = AdminHeader;
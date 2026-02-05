function AdminLayout({ children, activePage = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  // Explicitly reference global components to ensure visibility in Babel scope
  const AdminSidebar = window.AdminSidebar;
  const AdminHeader = window.AdminHeader;

  return (
    <div className="min-h-screen bg-gray-50 flex" data-name="AdminLayout" data-file="components/admin/AdminLayout.js">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen ? (
        <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
        ></div>
      ) : null}

      {/* Sidebar */}
      {AdminSidebar ? <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage={activePage} /> : null}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[var(--sidebar-width)] transition-all duration-300">
        {AdminHeader ? <AdminHeader onMenuClick={() => setSidebarOpen(true)} /> : null}
        
        <main className="flex-1 p-4 md:p-6 lg:p-6 overflow-x-hidden">
            {children}
        </main>
        
        <footer className="px-8 py-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Smart Wardrobe Admin Panel
        </footer>
      </div>
    </div>
  );
}

window.AdminLayout = AdminLayout;
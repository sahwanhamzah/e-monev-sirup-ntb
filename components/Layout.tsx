
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Settings, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Database,
  Building2,
  Bell,
  Newspaper,
  Monitor
} from 'lucide-react';
import { Role, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, currentPage, onPageChange, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tutup sidebar otomatis saat ganti halaman pada mobile
  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ, Role.ADMIN_OPD, Role.VIEWER] },
    { id: 'tv_monitor', label: 'TV Monitor', icon: Monitor, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ, Role.VIEWER] },
    { id: 'monitoring', label: 'Progres SIRUP', icon: BarChart3, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ, Role.ADMIN_OPD] },
    { id: 'reports', label: 'Laporan Resmi', icon: FileText, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ, Role.VIEWER] },
    { id: 'news_manage', label: 'Manajemen Berita', icon: Newspaper, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ] },
    { id: 'opd', label: 'Data OPD', icon: Building2, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ] },
    { id: 'users', label: 'Manajemen User', icon: Users, roles: [Role.SUPER_ADMIN] },
    { id: 'backup', label: 'Backup & Restore', icon: Database, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ] },
    { id: 'settings', label: 'Pengaturan', icon: Settings, roles: [Role.SUPER_ADMIN, Role.ADMIN_PBJ] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  // Mode TV Monitor harus full screen tanpa header/sidebar standar jika aktif
  const isTVMode = currentPage === 'tv_monitor';

  if (isTVMode) {
    return (
      <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
        {/* Tombol Kembali rahasia di pojok untuk admin */}
        <button 
          onClick={() => onPageChange('dashboard')}
          className="fixed top-4 left-4 z-[200] p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all no-print"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      {/* Backdrop Overlay untuk Mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Off-Canvas */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[280px] bg-[#0f172a] text-white transition-transform duration-300 ease-in-out transform shadow-2xl lg:translate-x-0 lg:static lg:inset-0 lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d9534f] rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40">
              <FileText className="text-white" size={26} />
            </div>
            <div>
              <h1 className="font-black text-2xl leading-none tracking-tighter">SiRUP NTB</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Monitoring 2026</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-[15px] font-bold transition-all duration-300 group ${
                  currentPage === item.id 
                  ? 'bg-[#d9534f] text-white shadow-xl shadow-red-900/30 translate-x-1' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={currentPage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile Section (Bottom) */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-4 px-4 py-4 mb-4 bg-white/5 rounded-3xl border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-[#1e293b] text-slate-300 flex items-center justify-center text-lg font-black border border-white/10 shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-black truncate text-white tracking-tight">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest mt-0.5">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[15px] font-black text-[#d9534f] hover:bg-[#d9534f]/10 transition-all group active:scale-95"
            >
              <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
              Keluar Sesi
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Responsive */}
        <header className="no-print h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2.5 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              aria-label="Buka Menu"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {menuItems.find(i => i.id === currentPage)?.label || 'Aplikasi'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-[#d9534f] uppercase tracking-widest">Sistem Aktif</span>
                <span className="text-xs font-black text-slate-900 tracking-tight">Pemerintah Provinsi NTB</span>
             </div>
             <div className="w-[1px] h-8 bg-slate-200 hidden md:block"></div>
             <button className="p-3 text-slate-400 hover:text-[#d9534f] hover:bg-red-50 rounded-2xl relative transition-all active:scale-90">
               <Bell size={22} />
               <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#d9534f] rounded-full border-2 border-white animate-pulse"></span>
             </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-slate-50/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

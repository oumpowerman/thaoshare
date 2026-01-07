import React, { useState } from 'react';
import { LayoutDashboard, Users, Gavel, ClipboardList, UserSquare2, Menu, X, LogOut, User as UserIcon, CircleDollarSign, Bell, ShoppingBag } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, notifications } = useAppContext();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const menuItems = user?.role === 'ADMIN' ? [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/' },
    { icon: Users, label: 'จัดการวงแชร์', path: '/circles' },
    { icon: Gavel, label: 'ห้องประมูล', path: '/bidding' },
    { icon: ClipboardList, label: 'ติดตามยอดสลิป', path: '/collection' },
    { icon: UserSquare2, label: 'สมาชิก', path: '/members' },
  ] : [
    { icon: LayoutDashboard, label: 'หน้าแรก', path: '/' },
    { icon: ShoppingBag, label: 'หาเล่มแชร์', path: '/browse' },
    { icon: CircleDollarSign, label: 'วงของฉัน', path: '/my-circles' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 w-72 h-full bg-slate-900 text-white transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col shadow-2xl`}>
        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 z-[-1]"></div>
        
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
             <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
               ThaoPro<span className="text-blue-500 text-3xl leading-none">.</span>
             </h1>
             <p className="text-xs text-slate-400 font-medium tracking-wide opacity-80">ระบบจัดการวงแชร์มืออาชีพ</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="px-4 mb-2">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-500/20">
                    <UserIcon size={20} />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-slate-100">{user?.name}</p>
                    <Link to="/profile" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">แก้ไขข้อมูลส่วนตัว</Link>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Menu</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40 translate-x-1'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? 'text-white'
                        : 'group-hover:text-blue-400 transition-colors'
                    }
                  />
                  <span className="text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-900/50">
           <Link 
             to="/notifications" 
             className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
           >
              <div className="flex items-center gap-3">
                 <Bell size={20} className="group-hover:text-blue-400 transition-colors" />
                 <span className="text-sm font-medium">แจ้งเตือน</span>
              </div>
              {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-red-500/40 animate-pulse">{unreadCount}</span>
              )}
           </Link>
           <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={20} className="group-hover:text-red-400" />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 active:scale-95 transition-transform">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-800 text-lg">ThaoPro</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
            <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
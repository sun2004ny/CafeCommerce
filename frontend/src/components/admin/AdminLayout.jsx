import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, LogOut, ShoppingBag, ExternalLink,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';

const navItems = [
  { to: '/admin-panel/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin-panel/products', icon: Package, label: 'Products' },
  { to: '/admin-panel/users', icon: Users, label: 'Users' },
];

export default function AdminLayout() {
  const { logout, admin } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin-panel');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900/80 border-r border-white/10 flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rainbow-gradient-bg rounded-xl flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">CaféCommerce</p>
              <p className="text-xs text-violet-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'sidebar-nav-active'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-pink-300' : ''} />
                  <span className={isActive ? 'rainbow-gradient-text' : ''}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={16} />
            View Store
          </a>
          <div className="px-4 py-2 text-xs text-gray-500 truncate">{admin?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

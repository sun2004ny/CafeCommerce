import { Link, useNavigate } from '@remix-run/react';
import { Coffee, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Error logging out');
      navigate('/login');
    }
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CC';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#0f0d0c]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent">
                CaféCommerce
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] text-stone-400 uppercase font-mono tracking-widest leading-none">
                  Core Auth Active
                </p>
              </div>
            </div>
          </Link>

          {/* Right-side Auth & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {/* User Info Badge */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold font-mono">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-stone-100 leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono leading-tight">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200 cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl btn-amber text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <ShieldCheck size={14} />
                <span>Sign In</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

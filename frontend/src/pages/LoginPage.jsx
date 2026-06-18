import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLogo from '../components/auth/AuthLogo.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email.toLowerCase(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col min-h-screen p-12">
        <div className="absolute inset-0 login-ambient-overlay" />
        <div className="absolute inset-0 login-ambient-radials" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Logo — pinned to top */}
        <AuthLogo className="relative z-10" />

        {/* Hero copy — directly below logo */}
        <div className="relative z-10 max-w-lg mt-10">
          <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6 text-white">
            Your personal<br />
            <span className="rainbow-gradient-text">shopping hub</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 max-w-md leading-relaxed">
            Browse thousands of products, manage your cart, and track your profile — all in one beautiful dashboard.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-3xl" />
        <div className="w-full max-w-md animate-fade-in relative z-10 pt-4 pb-6 lg:py-6">
          <AuthLogo mobile className="mb-8" />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-4xl font-bold mb-2" style={{ color: 'white !important', background: 'none !important', WebkitBackgroundClip: 'unset !important', backgroundClip: 'unset !important' }}>Welcome back</h2>
            <p className="text-gray-400 mb-8 text-lg">Sign in to your account to continue</p>

            {error && (
              <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400 text-sm flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Your password"
                    className="w-full pl-12 pr-14 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rainbow-gradient-btn text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 mt-6">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} className="text-gray-900" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-400 mt-8 text-sm">
            No account yet?{' '}
            <Link
              to="/register"
              className="font-semibold bg-linear-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            >
              Create an account
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <p className="text-xs text-gray-500 text-center mb-3 font-mono uppercase tracking-wider">Demo</p>
            <p className="text-sm text-gray-300 text-center">Register an account above, then log in with those credentials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

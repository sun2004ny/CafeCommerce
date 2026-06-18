import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLogo from '../components/auth/AuthLogo.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.toLowerCase(), form.password);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((r) => ({ ...r, [k]: '' }));
  };

  const strength = form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
    ? 'strong' : form.password.length >= 6 ? 'medium' : form.password.length > 0 ? 'weak' : '';

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col min-h-screen p-12">
        <div className="absolute inset-0 login-ambient-overlay" />
        <div className="absolute inset-0 login-ambient-radials" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <AuthLogo />
            <div className="max-w-lg mt-10">
              <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 text-white">
                Join thousands of<br />
                <span className="rainbow-gradient-text">smart shoppers</span>
              </h1>
              <p className="text-lg max-w-sm text-gray-300 leading-relaxed">
                Access our curated marketplace with exclusive deals and a personalized dashboard.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Check, text: 'Secure & encrypted account' },
              { icon: Check, text: 'Personalized recommendations' },
              { icon: Check, text: 'Easy order management' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3" style={{ color: 'white !important' }}>
                <div className="w-7 h-7 rainbow-gradient-bg rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium" style={{ color: 'white !important' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
        <div className="absolute inset-0 bg-linear-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-3xl" />
        <div className="w-full max-w-xl lg:max-w-2xl animate-fade-in relative z-10 pt-4 pb-6 lg:py-6">
          <AuthLogo mobile className="mb-8" />

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <h2 className="text-3xl font-bold mb-1" style={{ color: 'white !important', background: 'none !important', WebkitBackgroundClip: 'unset !important', backgroundClip: 'unset !important' }}>Create account</h2>
            <p className="text-gray-400 mb-5 text-base">Start your shopping journey today</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Full Name</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="John Doe"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="john@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full" />{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min 6 characters"
                    className={`w-full pl-12 pr-14 py-3 bg-white/5 backdrop-blur-xl border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400 transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex gap-1.5 flex-1">
                      {['weak', 'medium', 'strong'].map((s, i) => (
                        <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          strength === 'weak' && i === 0 ? 'bg-red-500' :
                          strength === 'medium' && i <= 1 ? 'bg-yellow-500' :
                          strength === 'strong' ? 'bg-green-500' : 'bg-white/10'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xs font-medium capitalize ${
                      strength === 'weak' ? 'text-red-400' : strength === 'medium' ? 'text-yellow-400' : 'text-green-400'
                    }`}>{strength}</span>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full" />{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="Repeat password"
                    className={`w-full pl-12 pr-4 py-3 bg-white/5 backdrop-blur-xl border ${errors.confirm ? 'border-red-500' : 'border-white/10'} rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all duration-300`}
                  />
                </div>
                {errors.confirm && <p className="text-red-400 text-sm mt-1.5 flex items-center gap-2"><span className="w-1 h-1 bg-red-500 rounded-full" />{errors.confirm}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rainbow-gradient-btn text-gray-900 font-bold rounded-2xl flex items-center justify-center gap-3 mt-6">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={20} className="text-gray-900" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-400 mt-5 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold bg-linear-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

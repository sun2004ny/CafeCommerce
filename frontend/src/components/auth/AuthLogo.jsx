import { ShoppingBag } from 'lucide-react';

export default function AuthLogo({ mobile = false, className = '' }) {
  if (mobile) {
    return (
      <div className={`flex items-center gap-3 lg:hidden ${className}`}>
        <div className="w-10 h-10 rainbow-gradient-bg rounded-xl flex items-center justify-center rainbow-glow-shadow">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <span className="text-xl font-black text-white leading-tight">CaféCommerce</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div className="w-12 h-12 rainbow-gradient-bg rounded-2xl flex items-center justify-center rainbow-glow-shadow">
        <ShoppingBag size={24} className="text-white" />
      </div>
      <span className="text-3xl font-black text-white leading-tight">CaféCommerce</span>
    </div>
  );
}

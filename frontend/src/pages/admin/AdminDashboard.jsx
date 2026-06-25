import { useEffect, useState } from 'react';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { fetchAdminStats } from '../../api/admin.js';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={22} />
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Overview of your CaféCommerce store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          color="bg-violet-500/15 text-violet-400"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          color="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          color="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          sub="From completed orders"
          color="bg-amber-500/15 text-amber-400"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
        </div>

        {stats?.recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-white/10">
                  <th className="text-left py-3 font-medium">Customer</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Total</th>
                  <th className="text-right py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <p className="text-white font-medium">{order.userName}</p>
                      <p className="text-gray-500 text-xs">{order.userEmail}</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-xs capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-white font-medium">${order.total.toFixed(2)}</td>
                    <td className="py-3 text-right text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}

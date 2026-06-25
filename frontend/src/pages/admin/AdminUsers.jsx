import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, ChevronRight, ShoppingCart, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAdminUsers } from '../../api/admin.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdminUsers()
      .then((data) => setUsers(data.users || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-gray-400 mt-1">Manage registered customers</p>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((user) => (
            <Link
              key={user.id}
              to={`/admin-panel/users/${user.id}`}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-all group"
            >
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt=""
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Package size={14} /> {user.orderCount} orders
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingCart size={14} /> {user.cartCount} in cart
                </span>
              </div>
              <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
            </Link>
          ))}
          {!filtered.length && (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

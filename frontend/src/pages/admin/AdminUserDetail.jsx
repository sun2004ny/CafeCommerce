import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, ShoppingCart, Package, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchAdminUser, deleteAdminUser } from '../../api/admin.js';

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const result = await fetchAdminUser(userId);
      setData(result);
    } catch (err) {
      toast.error(err.message);
      navigate('/admin-panel/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const handleDelete = async () => {
    if (!confirm(`Delete user ${data?.user?.name}? This cannot be undone.`)) return;
    try {
      await deleteAdminUser(userId);
      toast.success('User deleted');
      navigate('/admin-panel/users');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  const { user, orders, cart } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/admin-panel/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt=""
              className="w-16 h-16 rounded-2xl object-cover rainbow-avatar-ring"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                <Mail size={14} /> {user.email}
              </p>
              <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
                <Calendar size={14} />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 text-sm"
          >
            <Trash2 size={16} /> Delete User
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Current Cart</h2>
            <span className="ml-auto text-sm text-gray-500">{cart?.length || 0} items</span>
          </div>
          {cart?.length ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-gray-500 text-xs">Qty: {item.quantity} · ${item.price}</p>
                  </div>
                  <p className="text-white font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Purchase History</h2>
            <span className="ml-auto text-sm text-gray-500">{orders?.length || 0} orders</span>
          </div>
          {orders?.length ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">${order.total.toFixed(2)}</span>
                    <span className="text-xs px-2 py-1 rounded-lg bg-violet-500/15 text-violet-300 capitalize">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">
                    {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}
                  </p>
                  {order.items?.length > 0 && (
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-gray-400">
                          {item.quantity}x {item.title} — ${item.price}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No purchases yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

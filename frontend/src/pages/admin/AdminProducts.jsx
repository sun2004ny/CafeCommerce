import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
} from '../../api/admin.js';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  discountPercentage: '0',
  stock: '0',
  stockStatus: 'in_stock',
  couponCode: '',
  category: 'general',
  brand: '',
  thumbnail: '',
};

function ProductForm({ form, setForm, onImageChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Product Name *</label>
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
          placeholder="Product name"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 resize-none"
          placeholder="Product description"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Price ($) *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Discount (%)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.discountPercentage}
          onChange={(e) => setForm((f) => ({ ...f, discountPercentage: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Stock Quantity</label>
        <input
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Stock Status</label>
        <select
          value={form.stockStatus}
          onChange={(e) => setForm((f) => ({ ...f, stockStatus: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        >
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Category</label>
        <input
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
          placeholder="e.g. groceries"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Brand</label>
        <input
          value={form.brand}
          onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Coupon Code</label>
        <input
          value={form.couponCode}
          onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
          placeholder="e.g. SAVE10"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm text-gray-400 mb-1">Product Image</label>
        <div className="flex gap-4 items-start">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/15 text-violet-300 border border-violet-500/30 rounded-xl cursor-pointer hover:bg-violet-500/25 transition-all">
            <Upload size={16} />
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
          </label>
          {form.thumbnail && (
            <img src={form.thumbnail} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
          )}
        </div>
        <input
          value={form.thumbnail.startsWith('data:') ? '' : form.thumbnail}
          onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
          className="w-full mt-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
          placeholder="Or paste image URL"
        />
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts({ search, limit: 100 });
      setProducts(data.products || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (product) => {
    setForm({
      title: product.title,
      description: product.description || '',
      price: String(product.price),
      discountPercentage: String(product.discountPercentage || 0),
      stock: String(product.stock || 0),
      stockStatus: product.stockStatus || 'in_stock',
      couponCode: product.couponCode || '',
      category: product.category || 'general',
      brand: product.brand || '',
      thumbnail: product.thumbnail || '',
    });
    setModal({ type: 'edit', id: product.id });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, thumbnail: reader.result }));
    reader.readAsDataURL(file);
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description,
    price: Number(form.price),
    discountPercentage: Number(form.discountPercentage) || 0,
    stock: Number(form.stock) || 0,
    stockStatus: form.stockStatus,
    couponCode: form.couponCode.trim() || null,
    category: form.category.trim() || 'general',
    brand: form.brand.trim(),
    thumbnail: form.thumbnail,
  });

  const handleSave = async () => {
    if (!form.title.trim() || !form.price) {
      toast.error('Title and price are required');
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (modal === 'create') {
        await createAdminProduct(payload);
        toast.success('Product created');
      } else {
        await updateAdminProduct(modal.id, payload);
        toast.success('Product updated');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteAdminProduct(id);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">Manage your store catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rainbow-gradient-btn text-gray-900 font-bold rounded-xl"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Stock</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Coupon</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnail || `https://placehold.co/48x48/1a1a26/888?text=P`}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{p.title}</p>
                          <p className="text-gray-500 text-xs">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      ${p.price}
                      {p.discountPercentage > 0 && (
                        <span className="text-emerald-400 text-xs ml-1">-{p.discountPercentage}%</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-300">{p.stock}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs ${
                        p.stockStatus === 'in_stock'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {p.stockStatus === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-violet-300 text-xs">{p.couponCode || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {modal === 'create' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <ProductForm form={form} setForm={setForm} onImageChange={handleImageChange} />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl text-gray-400 hover:bg-white/5">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rainbow-gradient-btn text-gray-900 font-bold rounded-xl"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

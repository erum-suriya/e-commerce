import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
const Ic = ({ d, cls = 'w-5 h-5' }) => (
  <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d}/>
  </svg>
);

const ICONS = {
  dash:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  box:     'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  bag:     'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  users:   'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  cart:    'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  heart:   'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  filter:  'M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z',
  plus:    'M12 4v16m8-8H4',
  edit:    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  close:   'M6 18L18 6M6 6l12 12',
  search:  'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  check:   'M5 13l4 4L19 7',
  ship:    'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z',
  logout:  'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu:    'M4 6h16M4 12h16M4 18h16',
  trend:   'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  star:    'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  ban:     'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
};

// Status colour map
const STATUS_STYLE = {
  processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50   text-blue-700   border-blue-200',
  shipped:    'bg-purple-50 text-purple-700  border-purple-200',
  delivered:  'bg-green-50  text-green-700   border-green-200',
  cancelled:  'bg-red-50    text-red-600     border-red-200',
  paid:       'bg-green-50  text-green-700   border-green-200',
  pending:    'bg-amber-50  text-amber-700   border-amber-200',
  admin:      'bg-indigo-50 text-indigo-700  border-indigo-200',
  user:       'bg-gray-50   text-gray-600    border-gray-200',
};

const Badge = ({ s }) => (
  <span className={`text-xs px-2 py-0.5 border rounded-full capitalize font-medium whitespace-nowrap ${STATUS_STYLE[s] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
    {s}
  </span>
);

// Stat card
const Stat = ({ label, value, sub, icon, bg }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">{label}</p>
      <p className="text-2xl font-display font-bold text-charcoal mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Ic d={ICONS[icon]} cls="w-5 h-5"/>
    </div>
  </div>
);

// Confirm dialog
const Confirm = ({ msg, onYes, onNo }) => (
  <div className="fixed inset-0 bg-black/40 z-[99] flex items-center justify-center p-4">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
      <p className="font-semibold text-sm mb-1">Confirm Action</p>
      <p className="text-sm text-gray-500 mb-6">{msg}</p>
      <div className="flex gap-3">
        <button onClick={onNo}  className="flex-1 border border-gray-200 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button onClick={onYes} className="flex-1 bg-red-500 text-white py-2 text-sm rounded-lg hover:bg-red-600 transition-colors">Confirm</button>
      </div>
    </div>
  </div>
);

// Simple bar chart
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="flex items-end gap-2 h-28 mt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-charcoal rounded-t transition-all duration-700"
            style={{ height: `${Math.max((d.total / max) * 100, 2)}%` }}/>
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const EMPTY_PRODUCT = {
  name:'', description:'', price:'', originalPrice:'',
  category:'women', subCategory:'', sizes:[], colors:[],
  stock:'', images:[], featured:false, newArrival:false,
};
const ALL_SIZES   = ['XS','S','M','L','XL','XXL'];
const ALL_CATS    = ['men','women','kids','accessories','fragrances'];
const ORDER_STEPS = ['processing','confirmed','shipped','delivered'];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tab,        setTab]        = useState('dashboard');
  const [drawer,     setDrawer]     = useState(false);
  const [confirm,    setConfirm]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');

  // Data
  const [dashData,   setDashData]   = useState(null);
  const [products,   setProducts]   = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [users,      setUsers]      = useState([]);
  const [carts,      setCarts]      = useState([]);
  const [wishlists,  setWishlists]  = useState([]);

  // Product form
  const [form,       setForm]       = useState(EMPTY_PRODUCT);
  const [editId,     setEditId]     = useState(null);
  const [imgInput,   setImgInput]   = useState('');
  const [formSection,setFormSection]= useState('basic');
  const [colorInput, setColorInput] = useState('');

  // Filters for product table
  const [catFilter,  setCatFilter]  = useState('all');
  const [stockFilter,setStockFilter]= useState('all');
  const [sortProd,   setSortProd]   = useState('newest');

  // Order filters
  const [orderStatus,setOrderStatus]= useState('all');
  const [orderSearch,setOrderSearch]= useState('');

  // User filters
  const [userRole,   setUserRole]   = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Pagination
  const [pages, setPages] = useState({ prod:1, order:1, user:1, cart:1 });
  const PER = 10;
  const goPage = (key, p) => setPages(prev => ({ ...prev, [key]: p }));

  // Detail modal
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailUser,  setDetailUser]  = useState(null);
  const [detailCart,  setDetailCart]  = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [ps, os, us, cs, sts] = await Promise.all([
        api.get('/products?limit=200'),
        api.get('/orders/all'),
        api.get('/auth/users'),
        api.get('/cart/all').catch(() => ({ data: [] })),
        api.get('/orders/stats'),
      ]);
      const prods = ps.data.products || [];
      const ords  = os.data || [];
      const usrs  = us.data?.users || us.data || [];
      const crts  = cs.data || [];

      setDashData({
        totalProducts:  prods.length,
        totalOrders:    ords.length,
        totalUsers:     usrs.length,
        totalCarts:     crts.length,
        revenue:        sts.data?.revenue || 0,
        byStatus:       sts.data?.byStatus || {},
        monthly:        sts.data?.monthly  || [],
        recentOrders:   ords.slice(0, 6),
        lowStock:       prods.filter(p => p.stock <= 5),
        topProducts:    [...prods].sort((a,b) => b.numReviews - a.numReviews).slice(0,5),
        activeUsers:    usrs.slice(0, 5),
      });
    } catch { toast.error('Dashboard load failed'); }
    setLoading(false);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=500');
      setProducts(res.data.products || []);
    } catch { toast.error('Products load failed'); }
    setLoading(false);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data || []);
    } catch { toast.error('Orders load failed'); }
    setLoading(false);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data?.users || res.data || []);
    } catch { toast.error('Users load failed'); }
    setLoading(false);
  };

  const loadCarts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart/all');
      setCarts(res.data || []);
    } catch { toast.error('Carts load failed'); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'dashboard')   loadDashboard();
    if (tab === 'products' || tab === 'add') loadProducts();
    if (tab === 'orders')      loadOrders();
    if (tab === 'users')       loadUsers();
    if (tab === 'carts')       loadCarts();
  }, [tab]);

  // ── Product CRUD ───────────────────────────────────────────────────────────
  const submitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form,
        price: Number(form.price), stock: Number(form.stock),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      };
      if (editId) {
        await api.put(`/products/${editId}`, data);
        toast.success('Product updated!');
      } else {
        await api.post('/products', data);
        toast.success('Product created!');
      }
      setForm(EMPTY_PRODUCT); setEditId(null); setImgInput(''); setColorInput('');
      setTab('products');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setLoading(false);
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({ ...p, price: String(p.price), stock: String(p.stock),
      originalPrice: p.originalPrice ? String(p.originalPrice) : '' });
    setFormSection('basic');
    setTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
    setConfirm(null);
  };

  const toggleSize  = s => setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x=>x!==s) : [...f.sizes,s] }));
  const addImage    = () => { if (!imgInput.trim()) return; setForm(f => ({ ...f, images: [...f.images, imgInput.trim()] })); setImgInput(''); };
  const removeImage = i => setForm(f => ({ ...f, images: f.images.filter((_,j)=>j!==i) }));
  const addColor    = () => { if (!colorInput.trim()) return; setForm(f => ({ ...f, colors: [...f.colors, colorInput.trim()] })); setColorInput(''); };
  const removeColor = i => setForm(f => ({ ...f, colors: f.colors.filter((_,j)=>j!==i) }));

  // ── Order actions ──────────────────────────────────────────────────────────
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      if (detailOrder?._id === id) setDetailOrder(prev => ({ ...prev, orderStatus: status }));
      toast.success('Status updated');
    } catch { toast.error('Update failed'); }
  };

  const shipOrder = async (id) => {
    try {
      const res = await api.put(`/orders/${id}/ship`);
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
      if (detailOrder?._id === id) setDetailOrder(res.data);
      toast.success('Marked as shipped & paid!');
    } catch { toast.error('Ship failed'); }
  };

  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: 'cancelled' } : o));
      if (detailOrder?._id === id) setDetailOrder(prev => ({ ...prev, orderStatus: 'cancelled' }));
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cancel failed'); }
    setConfirm(null);
  };

  // ── User actions ───────────────────────────────────────────────────────────
  const deleteUser = async (id) => {
    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    setConfirm(null);
  };

  const toggleUserRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/auth/users/${u._id}`, { role: newRole });
      setUsers(prev => prev.map(x => x._id === u._id ? res.data : x));
      toast.success(`Role changed to ${newRole}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Role change failed'); }
  };

  // ── Filtered + paginated data ──────────────────────────────────────────────
  const filteredProds = products
    .filter(p => {
      const matchCat   = catFilter   === 'all' || p.category === catFilter;
      const matchStock = stockFilter === 'all' ||
        (stockFilter === 'out'   && p.stock === 0) ||
        (stockFilter === 'low'   && p.stock > 0 && p.stock <= 5) ||
        (stockFilter === 'in'    && p.stock > 5);
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStock && matchSearch;
    })
    .sort((a,b) => {
      if (sortProd === 'price-asc')  return a.price - b.price;
      if (sortProd === 'price-desc') return b.price - a.price;
      if (sortProd === 'stock-asc')  return a.stock - b.stock;
      if (sortProd === 'rating')     return b.rating - a.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderStatus === 'all' || o.orderStatus === orderStatus;
    const q = orderSearch.toLowerCase();
    const matchSearch = !q || o._id.includes(q) ||
      (o.user?.name  || '').toLowerCase().includes(q) ||
      (o.user?.email || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchRole = userRole === 'all' || u.role === userRole;
    const q = userSearch.toLowerCase();
    const matchSearch = !q ||
      (u.name  || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const pagSlice = (arr, key) => arr.slice((pages[key]-1)*PER, pages[key]*PER);
  const totalPg  = (arr) => Math.ceil(arr.length / PER);

  const Pager = ({ arr, k }) => {
    const tp = totalPg(arr);
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
        <p className="text-xs text-gray-400">{arr.length} total</p>
        <div className="flex gap-1">
          <button onClick={() => goPage(k, Math.max(1, pages[k]-1))} disabled={pages[k]===1}
            className="px-3 py-1 text-xs border border-gray-200 rounded hover:border-charcoal disabled:opacity-40 transition-colors">‹</button>
          {[...Array(tp)].map((_,i) => (
            <button key={i} onClick={() => goPage(k, i+1)}
              className={`px-3 py-1 text-xs border rounded transition-colors ${pages[k]===i+1?'bg-charcoal text-white border-charcoal':'border-gray-200 hover:border-charcoal'}`}>
              {i+1}
            </button>
          ))}
          <button onClick={() => goPage(k, Math.min(tp, pages[k]+1))} disabled={pages[k]===tp}
            className="px-3 py-1 text-xs border border-gray-200 rounded hover:border-charcoal disabled:opacity-40 transition-colors">›</button>
        </div>
      </div>
    );
  };

  // ── Sidebar links ──────────────────────────────────────────────────────────
  const NAV = [
    { id:'dashboard', label:'Dashboard',    icon:'dash'  },
    { id:'products',  label:'Products',     icon:'box'   },
    { id:'add',       label:'Add Product',  icon:'plus'  },
    { id:'orders',    label:'Orders',       icon:'bag'   },
    { id:'users',     label:'Users',        icon:'users' },
    { id:'carts',     label:'User Carts',   icon:'cart'  },
  ];

  const switchTab = (id) => {
    setTab(id);
    if (id !== 'add') { setEditId(null); setForm(EMPTY_PRODUCT); }
    setDrawer(false);
    setSearch(''); setOrderSearch(''); setUserSearch('');
    goPage('prod',1); goPage('order',1); goPage('user',1); goPage('cart',1);
  };

  const SideNav = () => (
    <div className="flex flex-col h-full bg-[#0f0f14] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link to="/" className="font-display text-xl font-bold">
          LUXE<span className="text-primary-400">.</span>
        </Link>
        <p className="text-xs text-white/40 mt-0.5 font-medium tracking-widest uppercase">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => switchTab(n.id)}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all
              ${tab===n.id ? 'bg-white/10 text-white border-r-2 border-primary-400' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <Ic d={ICONS[n.icon]} cls="w-4 h-4 flex-shrink-0"/>
            {n.label}
            {n.id==='orders' && orders.filter(o=>o.orderStatus==='processing').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {orders.filter(o=>o.orderStatus==='processing').length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/" className="text-center text-xs border border-white/20 py-1.5 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            View Site
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            className="text-xs bg-red-500/20 text-red-400 py-1.5 rounded hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1">
            <Ic d={ICONS.logout} cls="w-3 h-3"/> Logout
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ── DASHBOARD ────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const Dashboard = () => {
    if (loading || !dashData) return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-charcoal border-t-transparent rounded-full animate-spin"/>
      </div>
    );
    const d = dashData;
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.name}.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total Revenue"  value={`$${Number(d.revenue).toFixed(0)}`} sub="Excluding cancelled" icon="trend" bg="bg-green-50 text-green-600"/>
          <Stat label="Total Orders"   value={d.totalOrders}   sub={`${d.byStatus?.processing||0} pending`}  icon="bag"   bg="bg-blue-50 text-blue-600"/>
          <Stat label="Products"       value={d.totalProducts} sub={`${d.lowStock?.length||0} low stock`}     icon="box"   bg="bg-purple-50 text-purple-600"/>
          <Stat label="Customers"      value={d.totalUsers}    sub={`${d.totalCarts} active carts`}           icon="users" bg="bg-amber-50 text-amber-600"/>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-sm">Revenue — Last 6 Months</h2>
              <span className="text-xs text-gray-400">${Number(d.revenue).toLocaleString()} total</span>
            </div>
            {d.monthly?.length > 0
              ? <BarChart data={d.monthly}/>
              : <p className="text-sm text-gray-400 py-8 text-center">No revenue data yet</p>}
          </div>

          {/* Order status donut-style */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <h2 className="font-medium text-sm mb-4">Order Status</h2>
            <div className="space-y-3">
              {Object.entries(d.byStatus||{}).map(([s, count]) => {
                const pct = d.totalOrders ? Math.round((count/d.totalOrders)*100) : 0;
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="capitalize text-gray-600">{s}</span>
                      <span className="font-medium">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full transition-all duration-700
                        ${s==='delivered'?'bg-green-500':s==='cancelled'?'bg-red-400':s==='shipped'?'bg-purple-500':s==='confirmed'?'bg-blue-500':'bg-amber-400'}`}
                        style={{ width:`${pct}%` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-sm">Recent Orders</h2>
              <button onClick={() => switchTab('orders')} className="text-xs text-primary-500 hover:underline">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-2 text-xs text-gray-400 font-medium">Order</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Customer</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Total</th>
                    <th className="pb-2 text-xs text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentOrders?.map(o => (
                    <tr key={o._id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-xs font-mono font-medium">#{o._id.slice(-7).toUpperCase()}</td>
                      <td className="py-2.5 text-xs text-gray-600">{o.user?.name||'Guest'}</td>
                      <td className="py-2.5 text-xs font-semibold">${o.totalPrice?.toFixed(2)}</td>
                      <td className="py-2.5"><Badge s={o.orderStatus}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low stock */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-sm">Low Stock Alert</h2>
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full border border-red-100">
                {d.lowStock?.length||0} items
              </span>
            </div>
            {d.lowStock?.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">✓ All items stocked</p>
              : d.lowStock?.slice(0,6).map(p => (
                  <div key={p._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-9 h-11 bg-gray-50 overflow-hidden rounded flex-shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                      ${p.stock===0?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>
                      {p.stock===0?'OUT':`${p.stock}`}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── PRODUCTS TABLE ────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const Products = () => {
    const paged = pagSlice(filteredProds, 'prod');
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Products</h1>
            <p className="text-sm text-gray-400">{filteredProds.length} products</p>
          </div>
          <button onClick={() => switchTab('add')}
            className="flex items-center gap-2 bg-charcoal text-white px-4 py-2 text-xs font-semibold tracking-widest uppercase rounded hover:bg-primary-600 transition-colors">
            <Ic d={ICONS.plus} cls="w-4 h-4"/> Add Product
          </button>
        </div>

        {/* Filters bar */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <Ic d={ICONS.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => { setSearch(e.target.value); goPage('prod',1); }}
              placeholder="Search products..."
              className="w-full border border-gray-200 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-charcoal transition-colors"/>
          </div>

          {/* Category */}
          <select value={catFilter} onChange={e => { setCatFilter(e.target.value); goPage('prod',1); }}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white">
            <option value="all">All Categories</option>
            {ALL_CATS.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
          </select>

          {/* Stock */}
          <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); goPage('prod',1); }}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white">
            <option value="all">All Stock</option>
            <option value="in">In Stock (&gt;5)</option>
            <option value="low">Low Stock (1–5)</option>
            <option value="out">Out of Stock</option>
          </select>

          {/* Sort */}
          <select value={sortProd} onChange={e => setSortProd(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white">
            <option value="newest">Newest First</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="stock-asc">Stock ↑</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Product','Category','Price / Original','Stock','Sizes','Badges','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? [...Array(5)].map((_,i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4"><div className="flex gap-3 items-center"><div className="w-10 h-12 bg-gray-200 rounded"/><div className="h-3 bg-gray-200 rounded w-28"/></div></td>
                        {[...Array(5)].map((_,j)=><td key={j} className="px-4 py-4"><div className="h-3 bg-gray-200 rounded w-16"/></td>)}
                        <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-20"/></td>
                      </tr>
                    ))
                  : paged.length === 0
                    ? <tr><td colSpan={7} className="text-center py-16 text-gray-400 text-sm">No products found</td></tr>
                    : paged.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover"/>}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-charcoal line-clamp-1 max-w-[150px]">{p.name}</p>
                                <p className="text-xs text-gray-400 capitalize">{p.subCategory || p.category}</p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {[1,2,3,4,5].map(s=>(
                                    <svg key={s} className={`w-2.5 h-2.5 ${s<=Math.round(p.rating)?'text-amber-400':'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs capitalize bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold">${p.price}</p>
                            {p.originalPrice && <p className="text-xs text-gray-400 line-through">${p.originalPrice}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                              ${p.stock===0?'bg-red-50 text-red-600':p.stock<=5?'bg-amber-50 text-amber-600':'bg-green-50 text-green-700'}`}>
                              {p.stock===0?'Out':p.stock+' units'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.sizes?.slice(0,3).map(s=>(
                                <span key={s} className="text-xs border border-gray-200 px-1 py-0.5 text-gray-500 rounded">{s}</span>
                              ))}
                              {p.sizes?.length>3 && <span className="text-xs text-gray-400">+{p.sizes.length-3}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {p.featured   && <span className="text-xs bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded border border-primary-100">Featured</span>}
                              {p.newArrival && <span className="text-xs bg-charcoal text-white px-1.5 py-0.5 rounded">New</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Link to={`/product/${p._id}`} target="_blank"
                                className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                                <Ic d={ICONS.eye} cls="w-4 h-4"/>
                              </Link>
                              <button onClick={() => startEdit(p)}
                                className="p-1.5 rounded text-gray-400 hover:text-charcoal hover:bg-gray-100 transition-colors" title="Edit">
                                <Ic d={ICONS.edit} cls="w-4 h-4"/>
                              </button>
                              <button onClick={() => setConfirm({ msg:`Delete "${p.name}"?`, onYes:()=>deleteProduct(p._id) })}
                                className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                <Ic d={ICONS.trash} cls="w-4 h-4"/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-2"><Pager arr={filteredProds} k="prod"/></div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── ADD / EDIT PRODUCT FORM ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const ProductForm = () => (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-4">
        <button onClick={() => { setTab('products'); setEditId(null); setForm(EMPTY_PRODUCT); }}
          className="p-2 rounded-lg border border-gray-200 hover:border-charcoal transition-colors text-gray-500 hover:text-charcoal">
          <Ic d="M15 19l-7-7 7-7" cls="w-4 h-4"/>
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold">{editId ? 'Edit Product' : 'Add New Product'}</h1>
          {editId && <p className="text-xs text-gray-400">ID: {editId}</p>}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id:'basic',   label:'Basic Info'  },
          { id:'media',   label:'Images'      },
          { id:'variants',label:'Sizes & Colors'},
          { id:'settings',label:'Settings'    },
        ].map(s => (
          <button key={s.id} onClick={() => setFormSection(s.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all
              ${formSection===s.id?'bg-white text-charcoal shadow-sm':'text-gray-500 hover:text-charcoal'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={submitProduct}>
        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">

          {/* ── Basic Info ── */}
          {formSection === 'basic' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Product Name *</label>
                <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="e.g. Floral Embroidered Kurta"/>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Description *</label>
                <textarea required rows={5} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors resize-none"
                  placeholder="Describe the product — fabric, fit, occasion, care instructions..."/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Selling Price ($) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                      placeholder="49.99"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Original Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e=>setForm(f=>({...f,originalPrice:e.target.value}))}
                      className="w-full border border-gray-200 rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                      placeholder="79.99"/>
                  </div>
                  {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round((1-form.price/form.originalPrice)*100)}% discount
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Category *</label>
                  <select required value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors bg-white">
                    {ALL_CATS.map(c=>(
                      <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Sub-Category</label>
                  <input value={form.subCategory} onChange={e=>setForm(f=>({...f,subCategory:e.target.value}))}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                    placeholder="Kurta, Jeans, Body Mist..."/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Stock Quantity *</label>
                <input required type="number" min="0" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="100"/>
                {form.stock && Number(form.stock) <= 5 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ Low stock warning will show for admin</p>
                )}
              </div>
            </div>
          )}

          {/* ── Images ── */}
          {formSection === 'media' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-2">Add Image URLs</label>
                <div className="flex gap-2">
                  <input value={imgInput} onChange={e=>setImgInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addImage();}}}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                    placeholder="https://images.unsplash.com/... (press Enter or Add)"/>
                  <button type="button" onClick={addImage}
                    className="bg-charcoal text-white px-5 py-2.5 text-sm rounded-lg hover:bg-primary-600 transition-colors font-medium">
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Tip: Use Unsplash, Cloudinary, or your own hosted image URLs</p>
              </div>

              {form.images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((img,i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200">
                      <img src={img} alt="" className="w-full aspect-square object-cover"
                        onError={e => { e.target.src=''; e.target.className='w-full aspect-square bg-gray-100'; }}/>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(i)}
                          className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">×</button>
                      </div>
                      {i===0 && (
                        <span className="absolute bottom-1.5 left-1.5 text-xs bg-charcoal/80 text-white px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <Ic d={ICONS.box} cls="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                  <p className="text-sm text-gray-400">No images added yet</p>
                  <p className="text-xs text-gray-300 mt-1">Paste image URLs above and click Add</p>
                </div>
              )}
            </div>
          )}

          {/* ── Sizes & Colors ── */}
          {formSection === 'variants' && (
            <div className="space-y-6 animate-fade-in">
              {/* Sizes */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-3">Available Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)}
                      className={`w-14 h-11 text-sm border-2 font-semibold rounded-lg transition-all
                        ${form.sizes.includes(s)?'bg-charcoal text-white border-charcoal scale-105':'border-gray-200 text-charcoal hover:border-charcoal'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                {form.sizes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">Selected: {form.sizes.join(', ')}</p>
                )}
              </div>

              {/* Colors */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-3">Colors</label>
                <div className="flex gap-2 mb-3">
                  <input value={colorInput} onChange={e=>setColorInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addColor();}}}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                    placeholder="#000000, navy, rose, #ff5733 (press Enter or Add)"/>
                  <button type="button" onClick={addColor}
                    className="bg-charcoal text-white px-5 py-2.5 text-sm rounded-lg hover:bg-primary-600 transition-colors">
                    Add
                  </button>
                </div>
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.colors.map((c,i) => (
                      <div key={i} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
                        <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ background: c }}/>
                        <span className="text-xs text-gray-600">{c}</span>
                        <button type="button" onClick={() => removeColor(i)}
                          className="text-gray-400 hover:text-red-500 text-sm leading-none ml-1">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {formSection === 'settings' && (
            <div className="space-y-5 animate-fade-in">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Visibility & Display</p>
              {[
                { key:'featured',   label:'Featured Product', desc:'Show in "Featured Picks" section on homepage' },
                { key:'newArrival', label:'New Arrival Badge', desc:'Display NEW badge on product card' },
              ].map(t => (
                <label key={t.key}
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${form[t.key]?'border-charcoal bg-gray-50':'border-gray-100 hover:border-gray-200'}`}>
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ml-6
                    ${form[t.key]?'bg-charcoal':'bg-gray-200'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform
                      ${form[t.key]?'translate-x-7':'translate-x-1'}`}/>
                  </div>
                  <input type="checkbox" hidden checked={form[t.key]}
                    onChange={e=>setForm(f=>({...f,[t.key]:e.target.checked}))}/>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sticky action bar */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 mt-4 sticky bottom-4 shadow-lg">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-60">
            <Ic d={ICONS.check} cls="w-4 h-4"/>
            {loading?'Saving...':(editId?'Update Product':'Create Product')}
          </button>
          <div className="flex gap-2 ml-auto">
            {['basic','media','variants','settings'].map((s,i,a) => (
              <button key={s} type="button" onClick={() => setFormSection(s)}
                className={`w-2 h-2 rounded-full transition-colors ${formSection===s?'bg-charcoal':'bg-gray-200 hover:bg-gray-400'}`}
                title={s}/>
            ))}
          </div>
          <button type="button"
            onClick={() => setFormSection(
              formSection==='basic'?'media':formSection==='media'?'variants':formSection==='variants'?'settings':'basic'
            )}
            className="text-xs text-gray-500 hover:text-charcoal transition-colors">
            Next →
          </button>
        </div>
      </form>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ── ORDERS ────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const Orders = () => {
    const paged = pagSlice(filteredOrders, 'order');
    return (
      <div className="space-y-5 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-400">{filteredOrders.length} orders</p>
        </div>

        {/* Quick stat chips */}
        <div className="flex flex-wrap gap-2">
          {['all','processing','confirmed','shipped','delivered','cancelled'].map(s => (
            <button key={s} onClick={() => { setOrderStatus(s); goPage('order',1); }}
              className={`px-3 py-1.5 text-xs font-medium capitalize rounded-full border transition-all
                ${orderStatus===s?'bg-charcoal text-white border-charcoal':'border-gray-200 text-gray-500 hover:border-charcoal hover:text-charcoal'}`}>
              {s==='all'?'All':s}
              {s!=='all' && ` (${orders.filter(o=>o.orderStatus===s).length})`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Ic d={ICONS.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={orderSearch} onChange={e=>{setOrderSearch(e.target.value);goPage('order',1);}}
            placeholder="Search by order ID, customer name or email..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors bg-white"/>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Order ID','Customer','Items','Total','Status','Payment','Date','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? [...Array(5)].map((_,i)=>(
                      <tr key={i} className="animate-pulse">
                        {[...Array(8)].map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded"/></td>)}
                      </tr>
                    ))
                  : paged.length===0
                    ? <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">No orders found</td></tr>
                    : paged.map(o => (
                        <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-mono font-semibold text-charcoal">#{o._id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-medium whitespace-nowrap">{o.user?.name||'Guest'}</p>
                            <p className="text-xs text-gray-400">{o.user?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{o.items?.length} item(s)</td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold">${o.totalPrice?.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">{o.paymentMethod}</p>
                          </td>
                          <td className="px-4 py-3"><Badge s={o.orderStatus}/></td>
                          <td className="px-4 py-3"><Badge s={o.paymentStatus||'pending'}/></td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(o.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {/* View detail */}
                              <button onClick={() => setDetailOrder(o)}
                                className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                                <Ic d={ICONS.eye} cls="w-4 h-4"/>
                              </button>
                              {/* Ship */}
                              {['processing','confirmed'].includes(o.orderStatus) && (
                                <button onClick={() => setConfirm({ msg:`Mark order #${o._id.slice(-8).toUpperCase()} as Shipped & Paid?`, onYes:()=>{ shipOrder(o._id); setConfirm(null); } })}
                                  className="p-1.5 rounded text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors" title="Mark Shipped">
                                  <Ic d={ICONS.ship} cls="w-4 h-4"/>
                                </button>
                              )}
                              {/* Cancel */}
                              {!['cancelled','delivered'].includes(o.orderStatus) && (
                                <button onClick={() => setConfirm({ msg:`Cancel order #${o._id.slice(-8).toUpperCase()}?`, onYes:()=>cancelOrder(o._id) })}
                                  className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Cancel">
                                  <Ic d={ICONS.ban} cls="w-4 h-4"/>
                                </button>
                              )}
                              {/* Status dropdown */}
                              <select value={o.orderStatus} onChange={e=>updateStatus(o._id,e.target.value)}
                                className="text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-charcoal bg-white transition-colors">
                                {ORDER_STEPS.concat('cancelled').map(s=>(
                                  <option key={s} value={s} className="capitalize">{s}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-2"><Pager arr={filteredOrders} k="order"/></div>
        </div>

        {/* Order Detail Modal */}
        {detailOrder && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h2 className="font-display text-lg font-semibold">Order Detail</h2>
                  <p className="text-xs text-gray-400 font-mono">#{detailOrder._id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setDetailOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Ic d={ICONS.close} cls="w-5 h-5"/>
                </button>
              </div>
              <div className="p-6 space-y-5">
                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Customer</p>
                  <p className="font-medium text-sm">{detailOrder.user?.name||'Guest'}</p>
                  <p className="text-xs text-gray-500">{detailOrder.user?.email}</p>
                </div>
                {/* Shipping */}
                {detailOrder.shippingAddress && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Shipping Address</p>
                    <p className="text-sm text-gray-700">
                      {detailOrder.shippingAddress.street}, {detailOrder.shippingAddress.city}, {detailOrder.shippingAddress.state} {detailOrder.shippingAddress.zip}, {detailOrder.shippingAddress.country}
                    </p>
                  </div>
                )}
                {/* Items */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Items ({detailOrder.items?.length})</p>
                  <div className="space-y-3">
                    {detailOrder.items?.map((item,i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-14 h-18 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image && <img src={item.image} alt="" className="w-full h-full object-cover"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                          {item.size  && <p className="text-xs text-gray-400">Size: {item.size}</p>}
                          {item.color && <p className="text-xs text-gray-400">Color: {item.color}</p>}
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                        <p className="text-sm font-semibold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>${detailOrder.subtotal?.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>Shipping</span><span>${detailOrder.shippingPrice?.toFixed(2)||'0.00'}</span></div>
                  <div className="flex justify-between font-semibold text-base"><span>Total</span><span>${detailOrder.totalPrice?.toFixed(2)}</span></div>
                </div>
                {/* Status + Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Badge s={detailOrder.orderStatus}/>
                  <Badge s={detailOrder.paymentStatus||'pending'}/>
                  {['processing','confirmed'].includes(detailOrder.orderStatus) && (
                    <button onClick={() => { shipOrder(detailOrder._id); }}
                      className="ml-auto flex items-center gap-1.5 bg-purple-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                      <Ic d={ICONS.ship} cls="w-3.5 h-3.5"/> Mark Shipped & Paid
                    </button>
                  )}
                  {detailOrder.orderStatus === 'shipped' && (
                    <button onClick={() => updateStatus(detailOrder._id, 'delivered')}
                      className="ml-auto flex items-center gap-1.5 bg-green-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                      <Ic d={ICONS.check} cls="w-3.5 h-3.5"/> Mark Delivered
                    </button>
                  )}
                  {!['cancelled','delivered'].includes(detailOrder.orderStatus) && (
                    <button onClick={() => setConfirm({ msg:'Cancel this order?', onYes:()=>cancelOrder(detailOrder._id) })}
                      className="flex items-center gap-1.5 border border-red-300 text-red-500 text-xs px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Ic d={ICONS.ban} cls="w-3.5 h-3.5"/> Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── USERS ─────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const Users = () => {
    const paged = pagSlice(filteredUsers, 'user');
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Users</h1>
            <p className="text-sm text-gray-400">{filteredUsers.length} registered customers</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1.5 rounded-full font-medium">
              {users.filter(u=>u.role==='admin').length} Admins
            </span>
            <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full font-medium">
              {users.filter(u=>u.role==='user').length} Customers
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Ic d={ICONS.search} cls="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={userSearch} onChange={e=>{setUserSearch(e.target.value);goPage('user',1);}}
              placeholder="Search users..."
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"/>
          </div>
          <select value={userRole} onChange={e=>{setUserRole(e.target.value);goPage('user',1);}}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal bg-white">
            <option value="all">All Roles</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['User','Email','Role','Joined','Actions'].map(h=>(
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? [...Array(5)].map((_,i)=>(
                      <tr key={i} className="animate-pulse">
                        {[...Array(5)].map((_,j)=><td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded"/></td>)}
                      </tr>
                    ))
                  : paged.length===0
                    ? <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                        {users.length===0
                          ? 'Users endpoint not returning data — check /auth/users route'
                          : 'No users match your search'}
                      </td></tr>
                    : paged.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-charcoal text-white rounded-full flex items-center justify-center text-sm font-display font-bold flex-shrink-0">
                                {u.name?.[0]?.toUpperCase()||'?'}
                              </div>
                              <p className="text-xs font-semibold">{u.name}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{u.email}</td>
                          <td className="px-4 py-3"><Badge s={u.role}/></td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {/* View user detail */}
                              <button onClick={() => setDetailUser(u)}
                                className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="View">
                                <Ic d={ICONS.eye} cls="w-4 h-4"/>
                              </button>
                              {/* Toggle role (not self) */}
                              {u._id !== user._id && (
                                <button onClick={() => setConfirm({ msg:`Change "${u.name}" role to ${u.role==='admin'?'user':'admin'}?`, onYes:()=>{ toggleUserRole(u); setConfirm(null); } })}
                                  className="p-1.5 rounded text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                                  title={`Make ${u.role==='admin'?'Customer':'Admin'}`}>
                                  <Ic d={ICONS.refresh} cls="w-4 h-4"/>
                                </button>
                              )}
                              {/* Delete (not self) */}
                              {u._id !== user._id && (
                                <button onClick={() => setConfirm({ msg:`Delete user "${u.name}"? This cannot be undone.`, onYes:()=>deleteUser(u._id) })}
                                  className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                                  <Ic d={ICONS.trash} cls="w-4 h-4"/>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-2"><Pager arr={filteredUsers} k="user"/></div>
        </div>

        {/* User detail modal */}
        {detailUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-display text-lg font-semibold">User Profile</h2>
                <button onClick={() => setDetailUser(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <Ic d={ICONS.close} cls="w-5 h-5"/>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-charcoal text-white rounded-full flex items-center justify-center text-2xl font-display font-bold">
                    {detailUser.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{detailUser.name}</p>
                    <p className="text-sm text-gray-500">{detailUser.email}</p>
                    <Badge s={detailUser.role}/>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">User ID</span><span className="font-mono text-xs">{detailUser._id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Joined</span><span>{new Date(detailUser.createdAt).toLocaleDateString()}</span></div>
                  {detailUser.address?.city && (
                    <div className="flex justify-between"><span className="text-gray-400">City</span><span>{detailUser.address.city}</span></div>
                  )}
                </div>
                {detailUser._id !== user._id && (
                  <div className="flex gap-3">
                    <button onClick={() => { setConfirm({ msg:`Change "${detailUser.name}" to ${detailUser.role==='admin'?'user':'admin'}?`, onYes:()=>{ toggleUserRole(detailUser); setDetailUser(null); setConfirm(null); }}); }}
                      className="flex-1 border border-indigo-300 text-indigo-600 text-xs py-2.5 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                      Make {detailUser.role==='admin'?'Customer':'Admin'}
                    </button>
                    <button onClick={() => { setConfirm({ msg:`Delete "${detailUser.name}"?`, onYes:()=>{ deleteUser(detailUser._id); setDetailUser(null); } }); }}
                      className="flex-1 border border-red-300 text-red-500 text-xs py-2.5 rounded-lg hover:bg-red-50 transition-colors font-medium">
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── USER CARTS ────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  const UserCarts = () => {
    const paged = pagSlice(carts, 'cart');
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">User Carts</h1>
            <p className="text-sm text-gray-400">{carts.length} active carts</p>
          </div>
          <button onClick={loadCarts} className="flex items-center gap-2 text-xs text-gray-500 hover:text-charcoal transition-colors border border-gray-200 px-3 py-2 rounded-lg">
            <Ic d={ICONS.refresh} cls="w-4 h-4"/> Refresh
          </button>
        </div>

        <div className="grid gap-4">
          {loading
            ? [...Array(3)].map((_,i)=>(
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"/>
                  <div className="h-3 bg-gray-200 rounded w-1/4"/>
                </div>
              ))
            : paged.length===0
              ? <div className="bg-white border border-gray-100 rounded-xl p-16 text-center text-gray-400">
                  <Ic d={ICONS.cart} cls="w-12 h-12 mx-auto mb-3 text-gray-300"/>
                  <p>No active carts found</p>
                  <p className="text-xs mt-1">Make sure the /cart/all route is set up</p>
                </div>
              : paged.map(cart => {
                  const total = cart.items?.reduce((s,i)=>s+(i.price||0)*(i.quantity||1),0)||0;
                  return (
                    <div key={cart._id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-charcoal text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {cart.user?.name?.[0]?.toUpperCase()||'?'}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{cart.user?.name||'Unknown'}</p>
                            <p className="text-xs text-gray-400">{cart.user?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display font-bold text-lg">${total.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{cart.items?.length||0} item(s)</p>
                        </div>
                      </div>

                      {/* Cart items */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {cart.items?.slice(0,4).map((item,i) => (
                          <div key={i} className="flex gap-2 bg-gray-50 rounded-lg p-2">
                            <div className="w-10 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                              {item.image && <img src={item.image} alt="" className="w-full h-full object-cover"/>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium line-clamp-1">{item.name||item.product?.name}</p>
                              <p className="text-xs text-gray-400">×{item.quantity}</p>
                              <p className="text-xs font-semibold">${((item.price||0)*(item.quantity||1)).toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                        {cart.items?.length > 4 && (
                          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-400">+{cart.items.length-4} more</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-400">
                          Last updated: {new Date(cart.updatedAt||cart.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })
          }
        </div>
        <Pager arr={carts} k="cart"/>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ── LAYOUT ────────────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-body">
      {confirm && <Confirm {...confirm} onNo={() => setConfirm(null)}/>}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0 h-full border-r border-gray-100">
        <SideNav/>
      </aside>

      {/* Mobile sidebar */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setDrawer(false)}/>
          <aside className="fixed left-0 top-0 h-full w-60 z-50 border-r border-gray-100 lg:hidden">
            <SideNav/>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setDrawer(true)} className="lg:hidden p-1.5 text-gray-500 hover:text-charcoal rounded-lg hover:bg-gray-100 transition-colors">
            <Ic d={ICONS.menu} cls="w-5 h-5"/>
          </button>
          <p className="text-sm font-medium text-charcoal capitalize flex-1">{tab.replace('-',' ')}</p>
          {orders.filter(o=>o.orderStatus==='processing').length > 0 && (
            <button onClick={() => switchTab('orders')}
              className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full font-medium animate-pulse">
              {orders.filter(o=>o.orderStatus==='processing').length} pending orders
            </button>
          )}
          <Link to="/" className="hidden sm:block text-xs text-gray-400 hover:text-charcoal transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
            ← Store
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === 'dashboard'  && <Dashboard/>}
          {tab === 'products'   && <Products/>}
          {tab === 'add'        && <ProductForm/>}
          {tab === 'orders'     && <Orders/>}
          {tab === 'users'      && <Users/>}
          {tab === 'carts'      && <UserCarts/>}
        </div>
      </main>
    </div>
  );
}
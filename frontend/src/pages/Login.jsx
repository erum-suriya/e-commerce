import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      toast.success(`Welcome back, ${res.data.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal text-white items-center justify-center p-16">
        <div>
          <h1 className="font-display text-5xl font-bold mb-6">
            Welcome<br />Back<span className="text-primary-400">.</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-sm">
            Sign in to access your orders, wishlist, and personalized recommendations.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10">
            <Link to="/" className="font-display text-3xl font-bold text-charcoal">
              LUXE<span className="text-primary-500">.</span>
            </Link>
            <h2 className="font-display text-3xl font-semibold mt-6 mb-2">Sign In</h2>
            <p className="text-gray-500">Don't have an account? <Link to="/register" className="text-primary-600 hover:underline">Register</Link></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
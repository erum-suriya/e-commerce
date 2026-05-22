import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      login(res.data);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 text-white items-center justify-center p-16">
        <div>
          <h1 className="font-display text-5xl font-bold mb-6">
            Join<br />LUXE<span className="text-charcoal">.</span>
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-sm">
            Create your account and discover a world of curated fashion at your fingertips.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 bg-cream">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10">
            <Link to="/" className="font-display text-3xl font-bold text-charcoal">
              LUXE<span className="text-primary-500">.</span>
            </Link>
            <h2 className="font-display text-3xl font-semibold mt-6 mb-2">Create Account</h2>
            <p className="text-gray-500">Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link></p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">Full Name</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="Your name"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="you@example.com"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Password</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="At least 6 characters"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Confirm Password</label>
              <input type="password" required value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="input-field" placeholder="Repeat password"/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
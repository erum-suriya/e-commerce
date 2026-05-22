import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STEPS = [
  { num: 1, label: 'Enter Email' },
  { num: 2, label: 'Shipping' },
  { num: 3, label: 'Payment' },
];

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]     = useState(user ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState('');
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: '', lastName: '', phone: '',
    street: '', city: '', state: '', zip: '', country: 'Pakistan'
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const shipping = totalPrice > 100 ? 0 : 10;
  const salesTax = parseFloat(((totalPrice - discount) * 0.05).toFixed(2));
  const total    = parseFloat((totalPrice - discount + shipping + salesTax).toFixed(2));

  const applyVoucher = () => {
    if (voucher.toUpperCase() === 'LUXE10') {
      setDiscount(parseFloat((totalPrice * 0.1).toFixed(2)));
      toast.success('10% discount applied!');
    } else {
      toast.error('Invalid voucher code');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return toast.error('Your cart is empty');
    setLoading(true);
    try {
      await api.post('/orders', {
        items: cart.map(i => ({
          product: i._id, name: i.name,
          image: i.images?.[0], price: i.price,
          quantity: i.quantity, size: i.size, color: i.color
        })),
        shippingAddress: {
          street: form.street, city: form.city,
          state: form.state, zip: form.zip, country: form.country
        },
        paymentMethod: 'COD'
      });
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  if (!cart.length) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-gray-400">Your cart is empty.</p>
      <Link to="/shop" className="btn-primary">Shop Now</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Checkout Header */}
      <div className="bg-white border-b border-gray-100 py-4 text-center">
        <Link to="/" className="font-display text-2xl font-bold text-charcoal">
          LUXE<span className="text-primary-500">.</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── Left: Steps ─────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Step 1: Email */}
            <div className={`bg-white border ${step >= 1 ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <button onClick={() => setStep(1)}
                className="w-full flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-charcoal text-white' : 'border border-gray-300 text-gray-400'}`}>
                    {step > 1 ? '✓' : '1'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Enter Email</span>
                </div>
                {step !== 1 && form.email && (
                  <span className="text-xs text-gray-400">{form.email}</span>
                )}
              </button>
              {step === 1 && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4 animate-fade-in">
                  {!user && (
                    <p className="text-xs text-gray-500 mb-4">
                      Already have an account?{' '}
                      <Link to="/login" className="font-semibold underline text-charcoal">Sign In</Link>
                    </p>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                    <input value={form.email} onChange={e => set('email', e.target.value)}
                      type="email" required placeholder="your@email.com"
                      className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-charcoal transition-colors bg-transparent"/>
                  </div>
                  <button onClick={() => setStep(2)}
                    className="btn-primary w-full mt-6">Continue to Shipping</button>
                </div>
              )}
            </div>

            {/* Step 2: Shipping */}
            <div className={`bg-white border ${step >= 2 ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <button onClick={() => step > 2 && setStep(2)}
                className="w-full flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${step > 2 ? 'bg-green-500 text-white' : step === 2 ? 'bg-charcoal text-white' : 'border border-gray-300 text-gray-400'}`}>
                    {step > 2 ? '✓' : '2'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Shipping</span>
                </div>
                {step > 2 && (
                  <span className="text-xs text-gray-400">{form.city}, {form.country}</span>
                )}
                {step >= 2 && (
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${step === 2 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                )}
              </button>
              {step === 2 && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'firstName', label: 'First Name', colSpan: 1 },
                      { key: 'lastName',  label: 'Last Name',  colSpan: 1 },
                      { key: 'phone',    label: 'Phone Number', colSpan: 2 },
                      { key: 'street',   label: 'Street Address', colSpan: 2 },
                      { key: 'city',     label: 'City', colSpan: 1 },
                      { key: 'state',    label: 'State / Province', colSpan: 1 },
                      { key: 'zip',      label: 'ZIP / Postal Code', colSpan: 1 },
                      { key: 'country',  label: 'Country', colSpan: 1 },
                    ].map(f => (
                      <div key={f.key} className={f.colSpan === 2 ? 'col-span-2' : ''}>
                        <label className="text-xs text-gray-500 mb-1 block">{f.label} *</label>
                        <input value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                          required
                          className="w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-charcoal transition-colors bg-transparent"/>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(3)}
                    className="btn-primary w-full mt-6">Proceed to Payment</button>
                </div>
              )}
            </div>

            {/* Step 3: Payment */}
            <div className={`bg-white border ${step >= 3 ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <button onClick={() => step >= 3 && setStep(3)}
                className="w-full flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${step === 3 ? 'bg-charcoal text-white' : 'border border-gray-300 text-gray-400'}`}>
                    3
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Payment</span>
                </div>
                {step >= 3 && (
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${step === 3 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                )}
              </button>
              {step === 3 && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4 animate-fade-in">
                  <div className="border border-gray-200 p-4 flex items-center gap-3 bg-gray-50">
                    <div className="w-4 h-4 rounded-full border-2 border-charcoal flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-charcoal"/>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay when your order arrives</p>
                    </div>
                  </div>
                  <button onClick={handleSubmit} disabled={loading}
                    className="btn-primary w-full mt-6 py-4">
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    🔒 Your information is secure and encrypted
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-5 sticky top-20">
              {/* Bag Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest">Your Bag ({cart.length})</h2>
                <span className="text-sm font-semibold">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-20 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium leading-tight line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.color && ' · '}
                        {item.color && item.color}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher */}
              <div className="border border-gray-200 mb-5">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                  Redeem Your Voucher
                </p>
                <div className="flex">
                  <input value={voucher} onChange={e => setVoucher(e.target.value)}
                    placeholder="Enter Code"
                    className="flex-1 px-3 py-2 text-sm focus:outline-none bg-transparent placeholder-gray-400"/>
                  <button onClick={applyVoucher}
                    className="bg-charcoal text-white px-4 text-xs font-semibold tracking-widest uppercase hover:bg-primary-600 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3">Order Summary</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Price incl. tax</span><span>${totalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Voucher discount</span><span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Sales Tax (5%)</span><span>${salesTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>

              {step === 3 && (
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-primary w-full mt-5 py-4">
                  {loading ? 'Placing Order...' : 'Proceed to Payment'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
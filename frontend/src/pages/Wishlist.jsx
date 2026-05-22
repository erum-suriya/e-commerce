import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]'));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) { setLoading(false); return; }
    Promise.all(wishlistIds.map(id => api.get(`/products/${id}`).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean).map(r => r.data)))
      .finally(() => setLoading(false));
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlistIds.filter(x => x !== id);
    setWishlistIds(updated);
    setProducts(prev => prev.filter(p => p._id !== id));
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  const moveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-10 text-center">
        <h1 className="font-display text-4xl font-semibold">My Wishlist</h1>
        {!user && (
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 inline-block px-4 py-2 mt-3">
            ⚠️ Sign in to save your wishlist permanently.{' '}
            <Link to="/login" className="font-semibold underline">Login</Link>
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200"/>
                <div className="p-3 space-y-2"><div className="h-3 bg-gray-200 rounded"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 animate-fade-in">
            <svg className="w-20 h-20 mx-auto mb-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <h2 className="font-display text-3xl font-semibold mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8">Save items you love by tapping the heart icon on any product.</p>
            <Link to="/shop" className="btn-primary inline-block px-10">Start Shopping</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">{products.length} saved item{products.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(p => {
                const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
                return (
                  <div key={p._id} className="bg-white border border-gray-100 group hover:shadow-lg transition-all duration-300 animate-fade-in">
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
                      <Link to={`/product/${p._id}`}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                          : <div className="w-full h-full flex items-center justify-center text-gray-200">
                              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            </div>
                        }
                      </Link>
                      {discount && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5">-{discount}%</span>}

                      {/* Remove from wishlist */}
                      <button onClick={() => removeFromWishlist(p._id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                        title="Remove from wishlist">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                        </svg>
                      </button>

                      {/* Add to cart overlay */}
                      <div className="absolute bottom-0 left-0 right-0 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button onClick={() => moveToCart(p)}
                          className="flex-1 bg-charcoal text-white text-xs font-medium py-2.5 tracking-widest uppercase hover:bg-primary-600 transition-colors">
                          Move to Bag
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <Link to={`/product/${p._id}`} className="block text-xs font-medium text-charcoal hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{p.name}</Link>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-semibold">${p.price.toFixed(2)}</span>
                        {p.originalPrice && <span className="text-xs text-gray-400 line-through">${p.originalPrice.toFixed(2)}</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="px-3 pb-3 space-y-2">
                      <button onClick={() => moveToCart(p)}
                        className="w-full bg-charcoal text-white text-xs py-2.5 tracking-widest uppercase hover:bg-primary-600 transition-colors">
                        Add to Bag
                      </button>
                      <button onClick={() => removeFromWishlist(p._id)}
                        className="w-full border border-gray-200 text-gray-500 text-xs py-2 hover:border-charcoal hover:text-charcoal transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
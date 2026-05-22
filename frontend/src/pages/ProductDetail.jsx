import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Add to Bag Success Modal (like Khaadi image 4)
const AddedModal = ({ product, onClose, onCheckout }) => (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white max-w-sm w-full animate-slide-up" onClick={e => e.stopPropagation()}>
      <div className="flex items-start gap-4 p-6">
        <div className="w-20 h-24 bg-gray-50 flex-shrink-0 overflow-hidden">
          {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/>}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm uppercase tracking-wide text-charcoal">{product.name}</p>
          <p className="text-sm text-gray-500 mt-1">successfully added to your shopping bag!</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-charcoal transition-colors -mt-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 border-t border-gray-100">
        <button onClick={onClose}
          className="py-4 text-xs font-semibold tracking-widest uppercase text-charcoal border-r border-gray-100 hover:bg-gray-50 transition-colors">
          Continue Shopping
        </button>
        <button onClick={onCheckout}
          className="py-4 text-xs font-semibold tracking-widest uppercase bg-charcoal text-white hover:bg-primary-600 transition-colors">
          Checkout
        </button>
      </div>
    </div>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelSize]   = useState('');
  const [selectedColor, setSelColor] = useState('');
  const [qty, setQty]             = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [review, setReview]       = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [wished, setWished]       = useState(false);
  const [related, setRelated]     = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWished(wl.includes(res.data._id));
        // fetch related
        return api.get(`/products?category=${res.data.category}&limit=6`);
      })
      .then(res => setRelated((res.data.products || []).filter(p => p._id !== id).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const toggleWishlist = () => {
    const wl = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const next = wished ? wl.filter(x => x !== product._id) : [...wl, product._id];
    localStorage.setItem('wishlist', JSON.stringify(next));
    setWished(!wished);
    toast(wished ? 'Removed from wishlist' : '❤️ Added to wishlist', { duration: 1500 });
  };

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) return toast.error('Please select a size');
    addToCart(product, qty, selectedSize, selectedColor);
    setShowModal(true);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    setSubmitting(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      setReview({ rating: 5, comment: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="max-w-screen-xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-12 animate-pulse">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => <div key={i} className="w-20 h-24 bg-gray-200"/>)}
        </div>
        <div className="flex-1 bg-gray-200"/>
      </div>
      <div className="space-y-4 pt-4">
        <div className="h-5 bg-gray-200 rounded w-1/3"/>
        <div className="h-8 bg-gray-200 rounded w-3/4"/>
        <div className="h-6 bg-gray-200 rounded w-1/4"/>
        <div className="h-24 bg-gray-200 rounded"/>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-400 mb-4">Product not found.</p>
      <Link to="/shop" className="btn-primary inline-block">Back to Shop</Link>
    </div>
  );

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  return (
    <>
      {showModal && (
        <AddedModal
          product={product}
          onClose={() => setShowModal(false)}
          onCheckout={() => { setShowModal(false); navigate('/checkout'); }}
        />
      )}

      <div className="bg-white min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            <Link to="/shop" className="hover:text-charcoal transition-colors capitalize">Shop</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            <Link to={`/shop?category=${product.category}`} className="hover:text-charcoal transition-colors capitalize">{product.category}</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            <span className="text-charcoal truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Main Product Layout */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

            {/* ── Left: Images ────────────────────────────────────── */}
            <div className="flex gap-3">
              {/* Thumbnail strip */}
              {product.images?.length > 1 && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-20 overflow-hidden border-2 transition-all ${activeImg === i ? 'border-charcoal' : 'border-transparent hover:border-gray-200'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 relative bg-gray-50 overflow-hidden">
                {product.images?.[activeImg]
                  ? <img src={product.images[activeImg]} alt={product.name} className="w-full aspect-[4/5] object-cover"/>
                  : <div className="w-full aspect-[4/5] flex items-center justify-center text-gray-200">
                      <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                }

                {/* Wishlist on image */}
                <button onClick={toggleWishlist}
                  className={`absolute top-4 right-4 w-10 h-10 bg-white/90 flex items-center justify-center shadow-sm transition-all hover:scale-110
                    ${wished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                  <svg className="w-5 h-5" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* ── Right: Info ─────────────────────────────────────── */}
            <div className="pt-2 animate-slide-up">
              {/* Sub-category + name */}
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 capitalize">
                {product.subCategory || product.category}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-3 mt-4">
                <span className="font-display text-2xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-gray-400 line-through text-sm">${product.originalPrice.toFixed(2)}</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-medium">-{discount}%</span>
                  </>
                )}
              </div>

              {/* Rating */}
              {product.numReviews > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{product.numReviews} reviews</span>
                </div>
              )}

              <div className="border-t border-gray-100 mt-5 pt-5 space-y-6">
                {/* Quantity */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3">Quantity</p>
                  <div className="flex items-center border border-gray-200 w-fit">
                    <button onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors border-r border-gray-200">
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{qty}</span>
                    <button onClick={() => setQty(qty + 1)}
                      className="w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors border-l border-gray-200">
                      +
                    </button>
                  </div>
                </div>

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(c => (
                        <button key={c} onClick={() => setSelColor(c)}
                          className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110
                            ${selectedColor === c ? 'border-charcoal scale-110' : 'border-gray-200'}`}
                          style={{ background: c }} title={c}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-widest">Size</p>
                      <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(s => (
                        <button key={s} onClick={() => setSelSize(s)}
                          className={`min-w-[44px] h-10 px-3 text-xs font-medium border transition-all
                            ${selectedSize === s ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-charcoal hover:border-charcoal'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Bag button */}
                <button onClick={handleAddToCart} disabled={product.stock === 0}
                  className="w-full bg-charcoal text-white py-4 text-xs font-semibold tracking-widest uppercase
                    hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>

                {/* Wishlist text button */}
                <button onClick={toggleWishlist}
                  className="w-full border border-gray-200 py-3 text-xs font-semibold tracking-widest uppercase text-charcoal
                    hover:border-charcoal transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  {wished ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Details accordion */}
              <div className="border-t border-gray-100 mt-6">
                <button onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex items-center justify-between py-4 text-xs font-semibold uppercase tracking-widest">
                  Details
                  <svg className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                {detailsOpen && (
                  <div className="pb-4 animate-fade-in">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium text-charcoal">Description: </span>{product.description}
                    </p>
                    {product.stock > 0 && (
                      <p className="text-xs text-gray-400 mt-3">
                        <span className="font-medium">Availability:</span> {product.stock} units in stock
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Shipping info */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {[
                  { icon: '🚚', text: 'Free shipping on orders over $100' },
                  { icon: '↩️', text: 'Easy 30-day returns' },
                  { icon: '🔒', text: 'Secure checkout' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews ──────────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="font-display text-3xl font-semibold mb-10">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Existing */}
              <div>
                {product.reviews?.length === 0 ? (
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-6">
                    {product.reviews.map((r, i) => (
                      <div key={i} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-xs font-display">
                            {r.name[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{r.name}</span>
                          <div className="flex ml-auto gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <svg key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Write Review */}
              {user ? (
                <div>
                  <h3 className="font-display text-xl font-semibold mb-6">Write a Review</h3>
                  <form onSubmit={handleReview} className="space-y-5">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest block mb-3">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button" onClick={() => setReview(r => ({ ...r, rating: s }))}>
                            <svg className={`w-8 h-8 transition-colors ${s <= review.rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest block mb-3">Comment</label>
                      <textarea required rows={4} value={review.comment}
                        onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                        className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-charcoal transition-colors resize-none"
                        placeholder="Share your experience with this product..."/>
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 p-8 text-center">
                  <p className="text-gray-500 text-sm mb-4">Sign in to leave a review</p>
                  <Link to="/login" className="btn-primary inline-block">Login to Review</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products ─────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <h2 className="font-display text-3xl font-semibold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map(p => (
                <Link key={p._id} to={`/product/${p._id}`}
                  className="group bg-white border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      : <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium line-clamp-2 leading-snug">{p.name}</p>
                    <p className="text-sm font-semibold mt-1">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
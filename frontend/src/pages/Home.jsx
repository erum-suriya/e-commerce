import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useBanners } from '../hooks/useBanners';
import toast from 'react-hot-toast';

const useWishlist = () => {
  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem('wishlist') || '[]')
  );
  const toggle = (id) => {
    setWishlist(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('wishlist', JSON.stringify(next));
      return next;
    });
  };
  return { wishlist, toggle };
};

// ── Horizontal product row with arrows ────────────────────────────────────────
const ProductRow = ({ products, loading }) => {
  const { addToCart } = useCart();
  const { wishlist, toggle } = useWishlist();
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

  if (loading) return (
    <div className="flex gap-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-56 animate-pulse">
          <div className="aspect-[3/4] bg-gray-200"/>
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"/>
            <div className="h-3 bg-gray-200 rounded w-1/3"/>
          </div>
        </div>
      ))}
    </div>
  );

  if (!products.length) return (
    <div className="text-center py-10 text-gray-400 text-sm">
      No products yet — add some from the Admin Panel.
    </div>
  );

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      <button onClick={() => scroll(-1)}
        className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-5 z-10 w-10 h-10
          bg-white border border-gray-200 shadow-md flex items-center justify-center
          opacity-0 group-hover/row:opacity-100 transition-all hover:bg-charcoal hover:text-white hover:border-charcoal">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {products.map(p => {
          const isWished  = wishlist.includes(p._id);
          const discount  = p.originalPrice
            ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
          return (
            <div key={p._id}
              className="flex-shrink-0 w-56 group bg-white border border-gray-100 hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
                <Link to={`/product/${p._id}`}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                    : <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                  }
                </Link>

                {discount   && <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5">-{discount}%</span>}
                {p.newArrival && <span className="absolute top-2 left-2 bg-charcoal text-white text-xs px-2 py-0.5">NEW</span>}

                <button onClick={() => {
                  toggle(p._id);
                  toast(isWished ? 'Removed from wishlist' : '❤️ Added to wishlist', { duration: 1500 });
                }}
                  className={`absolute top-2 right-2 w-8 h-8 bg-white/90 flex items-center justify-center transition-all hover:scale-110
                    ${isWished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                  <svg className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-charcoal/90 text-white text-xs font-medium py-2.5
                  text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button onClick={() => addToCart(p, 1)} className="w-full tracking-widest uppercase">
                    + Add to Bag
                  </button>
                </div>
              </div>
              <div className="p-3">
                <Link to={`/product/${p._id}`}
                  className="block text-xs font-medium text-charcoal hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                  {p.name}
                </Link>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-semibold">${p.price.toFixed(2)}</span>
                  {p.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">${p.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button onClick={() => scroll(1)}
        className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-5 z-10 w-10 h-10
          bg-white border border-gray-200 shadow-md flex items-center justify-center
          opacity-0 group-hover/row:opacity-100 transition-all hover:bg-charcoal hover:text-white hover:border-charcoal">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  );
};

export default function Home() {
  const { banners: heroBanners }    = useBanners('hero');
  const { banners: announceBanners }= useBanners('announcement');
  const { banners: topBanners }     = useBanners('home_top');
  const { banners: midBanners }     = useBanners('home_mid');
  const { banners: catBanners }     = useBanners(); // all positions

  const [topPicks,    setTopPicks]    = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products?sort=newest&limit=10'),
      api.get('/products?sort=rating&limit=10'),
    ]).then(([t, b]) => {
      setTopPicks(t.data.products || []);
      setBestsellers(b.data.products || []);
    }).catch(() => {})
      .finally(() => setProdLoading(false));
  }, []);

  // Hero banner (first active one)
  const hero = heroBanners[0];

  // Mid sale banner
  const midBanner = midBanners[0];

  // Announcement text
  const announcement = announceBanners[0];

  // Category banners
  const getCatBanner = (pos) =>
    catBanners.find(b => b.position === `category_${pos}`);

  const catDefs = ['women', 'men', 'kids', 'accessories'];

  return (
    <div className="min-h-screen bg-cream">

      {/* ── Hero Banner ─────────────────────────────────────────── */}
      {hero ? (
        <section className="relative overflow-hidden" style={{ background: hero.bgColor || '#1a1a2e' }}>
          <div className="relative min-h-[340px] sm:h-96 md:h-[500px] flex items-center">
            {hero.imageUrl && (
              <img src={hero.imageUrl} alt={hero.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"/>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"/>
            <div className="relative max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-20 py-16 w-full">
              {hero.badgeText && (
                <p className="text-xs tracking-[0.4em] uppercase mb-3 font-medium"
                  style={{ color: '#d4841f' }}>{hero.badgeText}</p>
              )}
              {hero.subtitle && (
                <p className="text-xs tracking-[0.4em] uppercase mb-3 font-medium text-gray-300">
                  {hero.subtitle}
                </p>
              )}
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight"
                style={{ color: hero.textColor || '#ffffff' }}>
                {hero.title}
              </h1>
              {hero.description && (
                <p className="mt-4 text-sm max-w-md leading-relaxed text-gray-300">{hero.description}</p>
              )}
              {hero.buttonText && (
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link to={hero.buttonLink || '/shop'}
                    className="bg-white text-charcoal px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-primary-50 transition-colors">
                    {hero.buttonText}
                  </Link>
                  <Link to="/shop?category=women"
                    className="border border-white/60 px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-charcoal transition-colors"
                    style={{ color: hero.textColor || '#ffffff' }}>
                    Explore All
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* Fallback hero if no banner set */
        <section className="relative overflow-hidden bg-charcoal">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-20 py-28 md:py-40">
            <p className="text-xs tracking-[0.4em] uppercase text-primary-400 mb-3 font-medium">New Collection</p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight">
              Dress with<br/><span className="text-primary-400 italic">Intention</span>
            </h1>
            <p className="text-gray-300 mt-4 text-sm max-w-md">Curated pieces that blend timeless elegance with contemporary style.</p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/shop" className="bg-primary-500 text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-primary-600 transition-colors">
                Shop Now
              </Link>
              <Link to="/shop?category=women" className="border border-white/30 text-white px-8 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-charcoal transition-colors">
                Explore
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Home Top Banner ──────────────────────────────────────── */}
      {topBanners.length > 0 && topBanners.map(b => (
        <section key={b._id} className="relative overflow-hidden"
          style={{ background: b.bgColor || '#f5f0eb' }}>
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-0">
            <div className="flex-1 px-8 md:px-16 py-12 order-2 md:order-1">
              {b.badgeText && (
                <p className="text-xs tracking-[0.3em] uppercase text-primary-500 mb-2 font-medium">{b.badgeText}</p>
              )}
              <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight"
                style={{ color: b.textColor || '#1a1a2e' }}>{b.title}</h2>
              {b.subtitle && <p className="mt-2 text-lg font-medium opacity-70" style={{ color: b.textColor }}>{b.subtitle}</p>}
              {b.description && <p className="mt-3 text-sm leading-relaxed opacity-60 max-w-sm" style={{ color: b.textColor }}>{b.description}</p>}
              {b.buttonText && (
                <Link to={b.buttonLink || '/shop'}
                  className="inline-block mt-6 bg-charcoal text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-primary-600 transition-colors">
                  {b.buttonText}
                </Link>
              )}
            </div>
            {b.imageUrl && (
              <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto md:h-72 overflow-hidden order-1 md:order-2">
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover"/>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* ── Category Grid — banner driven ────────────────────────── */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {catDefs.map(cat => {
            const b = getCatBanner(cat);
            return (
              <Link key={cat} to={b?.buttonLink || `/shop?category=${cat}`}
                className="relative overflow-hidden group aspect-[3/4] block">
                {b?.imageUrl
                  ? <img src={b.imageUrl} alt={b.title || cat}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0"/>
                  : <div className="w-full h-full bg-gray-100 absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">
                        {cat === 'women' ? '👗' : cat === 'men' ? '👔' : cat === 'kids' ? '🧸' : '👜'}
                      </span>
                    </div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"/>
                <div className="relative mt-auto p-4 absolute bottom-0 left-0 right-0">
                  <h3 className="font-display text-white text-xl font-semibold capitalize">
                    {b?.title || cat}
                  </h3>
                  {b?.subtitle && <p className="text-white/70 text-xs mt-0.5">{b.subtitle}</p>}
                  <p className="text-white/60 text-xs mt-0.5 group-hover:text-white transition-colors">
                    {b?.buttonText || 'Shop Now'} →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Top Picks For You ────────────────────────────────────── */}
      <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary-500 mb-2 font-medium">Curated For You</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Top Picks for You</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              We've handpicked the styles we know you'll love. Explore what's trending now.
            </p>
          </div>
          <Link to="/shop?sort=newest"
            className="hidden sm:block text-xs font-medium text-charcoal hover:text-primary-500 transition-colors tracking-widest uppercase border-b border-charcoal pb-0.5">
            View All
          </Link>
        </div>
        <ProductRow products={topPicks} loading={prodLoading}/>
      </section>

      {/* ── Mid Banner — sale strip ───────────────────────────────── */}
      {midBanner ? (
        <section className="relative overflow-hidden py-16 px-6 text-center"
          style={{ background: midBanner.bgColor || '#d4841f' }}>
          {midBanner.imageUrl && (
            <img src={midBanner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"/>
          )}
          <div className="relative">
            {midBanner.badgeText && (
              <p className="text-xs tracking-[0.4em] uppercase mb-2 font-medium opacity-70"
                style={{ color: midBanner.textColor || '#ffffff' }}>
                {midBanner.badgeText}
              </p>
            )}
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3"
              style={{ color: midBanner.textColor || '#ffffff' }}>
              {midBanner.title}
            </h2>
            {midBanner.description && (
              <p className="text-sm mb-6 opacity-80 max-w-sm mx-auto"
                style={{ color: midBanner.textColor || '#ffffff' }}>
                {midBanner.description}
              </p>
            )}
            {midBanner.buttonText && (
              <Link to={midBanner.buttonLink || '/shop'}
                className="inline-block bg-white text-charcoal px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-gray-100 transition-colors">
                {midBanner.buttonText}
              </Link>
            )}
          </div>
        </section>
      ) : (
        /* Fallback sale strip */
        <section className="bg-primary-500 py-12 px-4 text-center">
          <p className="text-xs tracking-[0.4em] uppercase mb-2 font-medium text-primary-100">Limited Time</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Eid Sale — Up to 40% Off</h2>
          <p className="text-primary-100 text-sm mb-6 max-w-sm mx-auto">Don't miss our biggest sale of the season.</p>
          <Link to="/shop?sale=true"
            className="bg-white text-primary-600 px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-primary-50 transition-colors">
            Shop the Sale
          </Link>
        </section>
      )}

      {/* ── Bestsellers ──────────────────────────────────────────── */}
      <section className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-primary-500 mb-2 font-medium">Most Loved</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">Bestsellers</h2>
            <p className="text-gray-400 text-sm mt-2 max-w-md">
              Discover this season's favorites and refresh your style with looks you'll wear on repeat.
            </p>
          </div>
          <Link to="/shop?sort=rating"
            className="hidden sm:block text-xs font-medium text-charcoal hover:text-primary-500 transition-colors tracking-widest uppercase border-b border-charcoal pb-0.5">
            View All
          </Link>
        </div>
        <ProductRow products={bestsellers} loading={prodLoading}/>
      </section>

      {/* ── Features strip ───────────────────────────────────────── */}
      <section className="border-t border-b border-gray-100 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10
          grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '🚚', title: 'Free Shipping',   sub: 'On orders over $100' },
            { icon: '↩️', title: 'Easy Returns',     sub: '30-day hassle-free' },
            { icon: '🔒', title: 'Secure Payment',   sub: '100% protected' },
            { icon: '💬', title: '24/7 Support',     sub: 'Always here for you' },
          ].map(f => (
            <div key={f.title}>
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-medium text-sm text-charcoal">{f.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
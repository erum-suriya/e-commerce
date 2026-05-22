import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// ─── Wishlist hook (localStorage) ───────────────────────────────────────────
const useWishlist = () => {
  const [wishlist, setWishlist] = useState(
    () => JSON.parse(localStorage.getItem('wishlist') || '[]')
  );
  const toggle = (id) => {
    setWishlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('wishlist', JSON.stringify(next));
      return next;
    });
  };
  return { wishlist, toggle };
};

// ─── Star Rating ─────────────────────────────────────────────────────────────
const Stars = ({ rating = 0, size = 'sm' }) => {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} className={`${s} ${n <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ShopCard = ({ product, gridCols, wishlist, onWishlist }) => {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const isWished = wishlist.includes(product._id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

  const isCompact = gridCols === 4;
  const isList    = gridCols === 1;

  if (isList) {
    return (
      <div className="flex gap-5 bg-white border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200 animate-fade-in group">
        <Link to={`/product/${product._id}`} className="flex-shrink-0">
          <div className="w-28 h-36 bg-gray-50 overflow-hidden">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              : <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>}
          </div>
        </Link>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between">
              <Link to={`/product/${product._id}`}>
                <h3 className="font-medium text-charcoal hover:text-primary-600 transition-colors leading-tight">{product.name}</h3>
              </Link>
              <button onClick={() => onWishlist(product._id)}
                className={`ml-3 flex-shrink-0 transition-colors ${isWished ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}>
                <svg className="w-5 h-5" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{product.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Stars rating={product.rating}/>
              {product.numReviews > 0 && <span className="text-xs text-gray-400">({product.numReviews})</span>}
            </div>
            {product.sizes?.length > 0 && (
              <div className="flex gap-1 mt-2">
                {product.sizes.map(s => (
                  <span key={s} className="text-xs border border-gray-200 px-1.5 py-0.5 text-gray-500">{s}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal text-lg">${product.price.toFixed(2)}</span>
              {product.originalPrice && <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>}
              {discount && <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 font-medium">-{discount}%</span>}
            </div>
            <button onClick={() => addToCart(product, 1)}
              className="btn-primary text-sm py-2 px-4">Add to Cart</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 animate-fade-in cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
        <Link to={`/product/${product._id}`}>
          {product.images?.[0]
            ? <img src={product.images[0]} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
            : <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-medium">{`-${discount}%`}</span>}
          {product.newArrival && <span className="bg-charcoal text-white text-xs px-2 py-0.5 font-medium">NEW</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => onWishlist(product._id)}
          className={`absolute top-2 right-2 w-8 h-8 bg-white flex items-center justify-center shadow-sm
            transition-all duration-200 hover:scale-110 ${isWished ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <svg className="w-4 h-4" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Quick Add */}
        {!isCompact && (
          <div className={`absolute bottom-0 left-0 right-0 bg-charcoal/95 text-white text-xs font-medium py-2.5 text-center
            transition-transform duration-300 ${hovered ? 'translate-y-0' : 'translate-y-full'}`}>
            <button onClick={() => addToCart(product, 1)} className="w-full tracking-wider uppercase">
              + Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={isCompact ? 'p-2' : 'p-3'}>
        <Link to={`/product/${product._id}`}>
          <h3 className={`font-medium text-charcoal hover:text-primary-600 transition-colors leading-tight line-clamp-2
            ${isCompact ? 'text-xs' : 'text-sm'}`}>
            {product.name}
          </h3>
        </Link>

        {!isCompact && product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Stars rating={product.rating}/>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        <div className={`flex items-center gap-1.5 ${isCompact ? 'mt-1' : 'mt-2'}`}>
          <span className={`font-semibold text-charcoal ${isCompact ? 'text-xs' : 'text-sm'}`}>
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className={`text-gray-400 line-through ${isCompact ? 'text-xs' : 'text-xs'}`}>
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {!isCompact && product.colors?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {product.colors.slice(0, 5).map(c => (
              <div key={c} className="w-3 h-3 rounded-full border border-gray-200 flex-shrink-0"
                style={{ background: c }} title={c}/>
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-gray-400">+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        {isCompact && (
          <button onClick={() => addToCart(product, 1)}
            className="w-full mt-2 bg-charcoal text-white text-xs py-1.5 hover:bg-primary-600 transition-colors">
            Add
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Filter Accordion Section ─────────────────────────────────────────────────
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-medium text-charcoal hover:text-primary-600 transition-colors">
        {title}
        <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="mt-3 space-y-2 animate-fade-in">{children}</div>}
    </div>
  );
};

// ─── Collection Circles (like Khaadi) ────────────────────────────────────────
const COLLECTIONS = [
  { label: 'New Arrivals',   emoji: '✨', color: 'from-rose-100 to-pink-200' },
  { label: 'Summer Edit',    emoji: '☀️', color: 'from-amber-100 to-yellow-200' },
  { label: 'Bestsellers',    emoji: '🏆', color: 'from-emerald-100 to-teal-200' },
  { label: 'Luxury Line',    emoji: '💎', color: 'from-indigo-100 to-purple-200' },
  { label: 'Casual Wear',    emoji: '👟', color: 'from-sky-100 to-blue-200' },
  { label: 'Sale',           emoji: '🏷️', color: 'from-red-100 to-rose-200' },
];

// ─── Grid Toggle Icons ────────────────────────────────────────────────────────
const GridIcon = ({ cols, current, onClick }) => {
  const grids = {
    1: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    2: null,
    3: null,
    4: null,
  };
  return (
    <button onClick={onClick}
      className={`p-1.5 transition-colors ${current === cols ? 'text-charcoal' : 'text-gray-300 hover:text-gray-500'}`}
      title={`${cols} column${cols > 1 ? 's' : ''} view`}
    >
      {cols === 1 ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={grids[1]}/>
        </svg>
      ) : (
        <div className={`grid gap-0.5`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, width: 20, height: 20 }}>
          {Array.from({ length: cols * 2 }).map((_, i) => (
            <div key={i} className="rounded-sm" style={{ background: 'currentColor', opacity: current === cols ? 1 : 0.3 }}/>
          ))}
        </div>
      )}
    </button>
  );
};

// ─── Main Shop Page ───────────────────────────────────────────────────────────
export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // URL state
  const category  = searchParams.get('category') || 'all';
  const search    = searchParams.get('search') || '';
  const sort      = searchParams.get('sort') || 'newest';
  const page      = Number(searchParams.get('page')) || 1;

  // Local state
  const [products, setProducts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [pages, setPages]           = useState(1);
  const [loading, setLoading]       = useState(true);
  const [gridCols, setGridCols]     = useState(3);
  const [searchInput, setSearchInput] = useState(search);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state
  const [priceRange, setPriceRange]   = useState([0, 500]);
  const [selSizes, setSelSizes]       = useState([]);
  const [selColors, setSelColors]     = useState([]);
  const [selRating, setSelRating]     = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  const ALL_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const ALL_COLORS = [
    { name: 'Black',  hex: '#000000' }, { name: 'White',  hex: '#ffffff' },
    { name: 'Navy',   hex: '#1a237e' }, { name: 'Red',    hex: '#f44336' },
    { name: 'Green',  hex: '#4caf50' }, { name: 'Beige',  hex: '#d2b48c' },
    { name: 'Pink',   hex: '#e91e63' }, { name: 'Gray',   hex: '#9e9e9e' },
  ];

  // Fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    params.set('sort', sort);
    params.set('page', page);
    params.set('limit', gridCols === 4 ? 16 : 12);
    params.set('minPrice', priceRange[0]);
    params.set('maxPrice', priceRange[1]);

    setLoading(true);
    api.get(`/products?${params}`)
      .then(res => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, sort, page, priceRange]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value && value !== 'all') p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput);
  };

  const toggleSize  = (s) => setSelSizes(p  => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleColor = (c) => setSelColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const clearAllFilters = () => {
    setPriceRange([0, 500]);
    setSelSizes([]);
    setSelColors([]);
    setSelRating(0);
    setInStockOnly(false);
    setSearchParams({});
    setSearchInput('');
  };

  const activeFilterCount =
    selSizes.length + selColors.length +
    (selRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0) +
    (category !== 'all' ? 1 : 0);

  const categories = [
    { slug: 'all', label: 'All' },
    { slug: 'women', label: 'Women' },
    { slug: 'men', label: 'Men' },
    { slug: 'kids', label: 'Kids' },
    { slug: 'accessories', label: 'Accessories' },
  ];

  const sortOptions = [
    { value: 'newest',     label: 'Recommended' },
    { value: 'price-asc',  label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating',     label: 'Top Rated' },
  ];

  // Client-side filter for size / color / rating / stock
  const filtered = products.filter(p => {
    if (selSizes.length  && !p.sizes?.some(s => selSizes.includes(s)))    return false;
    if (selColors.length && !p.colors?.some(c => selColors.some(sc => c.toLowerCase().includes(sc.toLowerCase())))) return false;
    if (selRating > 0    && p.rating < selRating)  return false;
    if (inStockOnly      && p.stock === 0)          return false;
    return true;
  });

  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  }[gridCols];

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg font-semibold">Filters</h2>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters}
            className="text-xs text-primary-600 hover:underline font-medium">
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category" defaultOpen>
        {categories.map(c => (
          <label key={c.slug} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio" name="category" checked={category === c.slug}
              onChange={() => setParam('category', c.slug === 'all' ? null : c.slug)}
              className="accent-charcoal w-3.5 h-3.5 flex-shrink-0"
            />
            <span className={`text-sm transition-colors ${category === c.slug ? 'text-charcoal font-medium' : 'text-gray-500 group-hover:text-charcoal'}`}>
              {c.label}
            </span>
          </label>
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price">
        <div className="px-1">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
          <div className="relative h-5 flex items-center">
            <div className="absolute w-full h-1 bg-gray-200 rounded"/>
            <div
              className="absolute h-1 bg-charcoal rounded"
              style={{ left: `${(priceRange[0]/500)*100}%`, right: `${100-(priceRange[1]/500)*100}%` }}
            />
            <input type="range" min="0" max="500" step="10"
              value={priceRange[0]}
              onChange={e => setPriceRange([Math.min(Number(e.target.value), priceRange[1]-10), priceRange[1]])}
              className="absolute w-full h-1 opacity-0 cursor-pointer z-10"
            />
            <input type="range" min="0" max="500" step="10"
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0]+10)])}
              className="absolute w-full h-1 opacity-0 cursor-pointer z-20"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <input type="number" min="0" max={priceRange[1]} value={priceRange[0]}
              onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="w-full border border-gray-200 px-2 py-1.5 text-xs text-center focus:outline-none focus:border-charcoal"/>
            <span className="text-gray-400 self-center">–</span>
            <input type="number" min={priceRange[0]} max="500" value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full border border-gray-200 px-2 py-1.5 text-xs text-center focus:outline-none focus:border-charcoal"/>
          </div>
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(s => (
            <button key={s} onClick={() => toggleSize(s)}
              className={`w-11 h-9 text-xs border transition-all font-medium
                ${selSizes.includes(s) ? 'bg-charcoal text-white border-charcoal' : 'border-gray-200 text-gray-600 hover:border-charcoal'}`}>
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="grid grid-cols-4 gap-2">
          {ALL_COLORS.map(c => (
            <button key={c.name} onClick={() => toggleColor(c.name)}
              className={`flex flex-col items-center gap-1 transition-all`}
              title={c.name}>
              <div className={`w-8 h-8 rounded-full border-2 transition-all
                ${selColors.includes(c.name) ? 'border-charcoal scale-110' : 'border-gray-200 hover:border-gray-400'}
                ${c.hex === '#ffffff' ? 'border-gray-300' : ''}`}
                style={{ background: c.hex }}/>
              <span className="text-xs text-gray-400 truncate w-full text-center">{c.name}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setSelRating(selRating === r ? 0 : r)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 transition-colors text-left
                ${selRating === r ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-3.5 h-3.5 ${s <= r ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">& up</span>
              {selRating === r && (
                <svg className="w-3 h-3 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
            className="accent-charcoal w-3.5 h-3.5"/>
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </FilterSection>
    </aside>
  );

  return (
    <div className="min-h-screen bg-cream">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-charcoal transition-colors">Home</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
          <span className="text-charcoal font-medium capitalize">
            {category === 'all' ? 'All Products' : category}
          </span>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Collection Circles ────────────────────────────────────────── */}
        <div className="flex gap-6 overflow-x-auto pb-4 mb-6 scrollbar-hide justify-center">
          {COLLECTIONS.map(col => (
            <div key={col.label} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${col.color} flex items-center justify-center
                text-2xl border-2 border-transparent group-hover:border-primary-400 transition-all duration-200
                group-hover:scale-105 shadow-sm`}>
                {col.emoji}
              </div>
              <span className="text-xs text-gray-500 text-center leading-tight max-w-[64px] group-hover:text-charcoal transition-colors">
                {col.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Top Bar: Search + Sort + Grid ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Mobile filter toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/>
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-1">
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 border border-gray-200 border-r-0 px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors bg-white"/>
            <button type="submit" className="bg-charcoal text-white px-4 hover:bg-primary-600 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
          </form>

          {/* Item count */}
          <span className="hidden sm:block text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
            <span className="font-semibold text-charcoal">{filtered.length}</span> items
          </span>

          {/* Sort */}
          <select value={sort} onChange={e => setParam('sort', e.target.value)}
            className="border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-charcoal bg-white min-w-[170px]">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Grid toggle */}
          <div className="flex items-center gap-0.5 border border-gray-200 bg-white px-2 flex-shrink-0">
            {[1, 2, 3, 4].map(n => (
              <button key={n} onClick={() => setGridCols(n)}
                title={n === 1 ? 'List view' : `${n}-column grid`}
                className={`p-1.5 transition-colors ${gridCols === n ? 'text-charcoal' : 'text-gray-300 hover:text-gray-500'}`}>
                {n === 1 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                  </svg>
                ) : (
                  <div style={{ display:'grid', gridTemplateColumns:`repeat(${n},1fr)`, gap:2, width:20, height:20 }}>
                    {Array.from({length: n*2}).map((_,i) => (
                      <div key={i} style={{ background:'currentColor', opacity: gridCols===n ? 1 : 0.3, borderRadius:1 }}/>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Active filter chips ──────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
            {category !== 'all' && (
              <span className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                {category}
                <button onClick={() => setParam('category', null)} className="ml-1 hover:text-gray-300">×</button>
              </span>
            )}
            {selSizes.map(s => (
              <span key={s} className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                Size: {s}
                <button onClick={() => toggleSize(s)} className="ml-1 hover:text-gray-300">×</button>
              </span>
            ))}
            {selColors.map(c => (
              <span key={c} className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                {c}
                <button onClick={() => toggleColor(c)} className="ml-1 hover:text-gray-300">×</button>
              </span>
            ))}
            {selRating > 0 && (
              <span className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                {selRating}★ & up
                <button onClick={() => setSelRating(0)} className="ml-1 hover:text-gray-300">×</button>
              </span>
            )}
            {inStockOnly && (
              <span className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                In Stock
                <button onClick={() => setInStockOnly(false)} className="ml-1 hover:text-gray-300">×</button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 500) && (
              <span className="flex items-center gap-1 bg-charcoal text-white text-xs px-3 py-1">
                ${priceRange[0]}–${priceRange[1]}
                <button onClick={() => setPriceRange([0, 500])} className="ml-1 hover:text-gray-300">×</button>
              </span>
            )}
          </div>
        )}

        {/* ── Main Layout: Sidebar + Grid ──────────────────────────────── */}
        <div className="flex gap-8">

          {/* Sidebar — desktop always visible */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <Sidebar/>
          </div>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <>
              <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}/>
              <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 p-6 overflow-y-auto lg:hidden animate-slide-in-right">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold">Filters</h2>
                  <button onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                <Sidebar/>
                <button onClick={() => setSidebarOpen(false)} className="btn-primary w-full mt-6">
                  View {filtered.length} Results
                </button>
              </div>
            </>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid ${gridClass} gap-4`}>
                {[...Array(gridCols === 1 ? 6 : 12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200" style={{ aspectRatio: gridCols === 1 ? 'auto' : '3/4', height: gridCols === 1 ? 100 : undefined }}/>
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"/>
                      <div className="h-3 bg-gray-200 rounded w-1/3"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className={`grid ${gridClass} gap-4`}>
                {filtered.map(p => (
                  <ShopCard
                    key={p._id}
                    product={p}
                    gridCols={gridCols}
                    wishlist={wishlist}
                    onWishlist={(id) => {
                      toggleWishlist(id);
                      toast(wishlist.includes(id) ? 'Removed from wishlist' : '❤️ Added to wishlist', { duration: 1500 });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400 col-span-full">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p className="text-xl font-display font-medium">No products found</p>
                <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                <button onClick={clearAllFilters} className="btn-primary mt-6 inline-block">Clear All Filters</button>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-1.5 mt-12">
                <button
                  onClick={() => setParam('page', Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  ‹
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button key={i} onClick={() => setParam('page', i + 1)}
                    className={`w-9 h-9 text-sm font-medium transition-all
                      ${page === i + 1 ? 'bg-charcoal text-white border border-charcoal' : 'bg-white border border-gray-200 hover:border-charcoal'}`}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setParam('page', Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="w-9 h-9 border border-gray-200 flex items-center justify-center hover:border-charcoal transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
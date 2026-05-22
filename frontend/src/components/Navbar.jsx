import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBanners } from '../hooks/useBanners';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg className="w-5 h-5" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
  </svg>
);
const BagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
  </svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
  </svg>
);

const NAV_LINKS = [
  { label: 'New In', href: '/shop?category=new' },
  { label: 'Eid. Eat. Repeat.', href: '/shop?category=eid', accent: true },
  { label: 'Ready to Wear', href: '/shop?category=women' },
  { label: 'Fabrics', href: '/shop?category=fabrics' },
  { label: 'Fragrances', href: '/shop?category=fragrances' },
  { label: 'Now Happening', href: '/shop', bold: true },
  { label: 'Sale', href: '/shop?sale=true', sale: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [wishlistCount] = useState(() => JSON.parse(localStorage.getItem('wishlist') || '[]').length);
  const searchRef = useRef(null);
  const { banners: announceBanners } = useBanners('announcement');
  const announcementText = announceBanners[0]?.title ||
    'FREE SHIPPING ON ORDERS OVER $100  •  NEW EID COLLECTION NOW LIVE  •  USE CODE LUXE10 FOR 10% OFF';
  const announceBg    = announceBanners[0]?.bgColor    || '#1a1a2e';
  const announceColor = announceBanners[0]?.textColor  || '#ffffff';

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* ── Announcement Bar ─────────────────────────────────────── */}
      {/* <div className="bg-charcoal text-white text-xs py-2 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="mx-8">
              FREE SHIPPING ON ORDERS OVER $100 &nbsp;•&nbsp; NEW EID COLLECTION NOW LIVE &nbsp;•&nbsp; USE CODE <span className="text-primary-400 font-medium">LUXE10</span> FOR 10% OFF &nbsp;•&nbsp; EASY 30-DAY RETURNS &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div> */}

      {announceBanners.length > 0 || true ? (
  <div className="text-xs py-2 overflow-hidden" style={{ background: announceBg, color: announceColor }}>
    <div className="flex animate-marquee whitespace-nowrap">
      {[...Array(4)].map((_, i) => (
        <span key={i} className="mx-8">{announcementText}</span>
      ))}
    </div>
  </div>
) : null}

      {/* ── Main Navbar ──────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Mobile Hamburger */}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 text-charcoal">
              <MenuIcon/>
            </button>

            {/* Logo */}
            <Link to="/" className="font-display text-2xl font-bold text-charcoal tracking-tight absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
              LUXE<span className="text-primary-500">.</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-6 mx-8">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-xs font-medium tracking-wide whitespace-nowrap transition-colors hover:text-primary-500
                    ${link.accent  ? 'text-primary-500' : ''}
                    ${link.bold    ? 'font-semibold text-charcoal' : 'text-gray-600'}
                    ${link.sale    ? 'text-red-500 font-semibold' : ''}
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)}
                className="p-2 text-charcoal hover:text-primary-500 transition-colors">
                <SearchIcon/>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 text-charcoal hover:text-primary-500 transition-colors">
                <HeartIcon/>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium leading-none">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <div className="relative">
                <button onClick={() => setUserDropOpen(!userDropOpen)}
                  className="p-2 text-charcoal hover:text-primary-500 transition-colors">
                  <UserIcon/>
                </button>
                {userDropOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserDropOpen(false)}/>
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-100 shadow-xl z-50 animate-fade-in">
                      {user ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-50">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                          <Link to="/orders" onClick={() => setUserDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                            My Orders
                          </Link>
                          <Link to="/wishlist" onClick={() => setUserDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-charcoal transition-colors">
                            <HeartIcon/>
                            Wishlist
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setUserDropOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-600 hover:bg-gray-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              Admin Panel
                            </Link>
                          )}
                          <div className="border-t border-gray-50 mt-1">
                            <button onClick={handleLogout}
                              className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                              </svg>
                              Sign Out
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal mb-1">Welcome</p>
                            <p className="text-xs text-gray-400">Sign in to your account</p>
                          </div>
                          <div className="px-4 pb-3 space-y-2">
                            <Link to="/login" onClick={() => setUserDropOpen(false)}
                              className="block w-full bg-charcoal text-white text-xs py-2.5 text-center font-medium tracking-widest uppercase hover:bg-primary-600 transition-colors">
                              Login
                            </Link>
                            <Link to="/register" onClick={() => setUserDropOpen(false)}
                              className="block w-full border border-charcoal text-charcoal text-xs py-2.5 text-center font-medium tracking-widest uppercase hover:bg-charcoal hover:text-white transition-colors">
                              Sign Up
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Cart Bag */}
              <button onClick={() => setIsOpen(true)} className="relative p-2 text-charcoal hover:text-primary-500 transition-colors">
                <BagIcon/>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-medium leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Search Overlay ─────────────────────────────────────── */}
        {searchOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setSearchOpen(false)}/>
            <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-xl animate-slide-up">
              <div className="max-w-2xl mx-auto px-6 py-6">
                <form onSubmit={handleSearch} className="flex items-center gap-4 border-b-2 border-charcoal pb-2">
                  <SearchIcon/>
                  <input
                    ref={searchRef}
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search for products, categories..."
                    className="flex-1 text-base focus:outline-none bg-transparent placeholder-gray-300"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-charcoal transition-colors">
                    <CloseIcon/>
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Women', 'Men', 'Kids', 'Accessories', 'Sale', 'New Arrivals'].map(t => (
                    <button key={t} onClick={() => { navigate(`/shop?search=${t}`); setSearchOpen(false); }}
                      className="text-xs border border-gray-200 px-3 py-1.5 hover:border-charcoal hover:text-charcoal transition-colors text-gray-500">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileOpen(false)}/>
          <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-display text-xl font-bold">LUXE<span className="text-primary-500">.</span></span>
              <button onClick={() => setMobileOpen(false)} className="p-1"><CloseIcon/></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-5 py-3 text-sm font-medium border-b border-gray-50 transition-colors hover:bg-gray-50
                    ${link.accent ? 'text-primary-500' : link.sale ? 'text-red-500' : 'text-charcoal'}`}>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="px-5 py-5 border-t border-gray-100 space-y-3">
              {user ? (
                <button onClick={handleLogout} className="btn-outline w-full text-center">Sign Out</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary w-full text-center block">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-outline w-full text-center block">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
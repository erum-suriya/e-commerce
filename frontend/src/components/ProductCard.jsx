import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      className="group bg-white card-shadow animate-fade-in"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount && <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-medium">-{discount}%</span>}
          {product.newArrival && <span className="bg-charcoal text-white text-xs px-2 py-0.5 font-medium">NEW</span>}
        </div>

        {/* Quick Add */}
        <div className={`absolute bottom-0 left-0 right-0 bg-charcoal text-white text-sm font-medium py-3 text-center 
          transition-transform duration-300 ${hovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button onClick={() => addToCart(product, 1)} className="w-full">
            Quick Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`} className="hover:text-primary-600 transition-colors">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">{product.name}</h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <svg key={s} className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                  fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-charcoal">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Colors */}
        {product.colors?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {product.colors.slice(0, 4).map(c => (
              <div key={c} className="w-3 h-3 rounded-full border border-gray-200" style={{ background: c }} title={c}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
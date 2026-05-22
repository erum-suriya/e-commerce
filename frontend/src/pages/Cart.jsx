import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-fade-in">
        <svg
          className="w-24 h-24 text-gray-200 mb-6"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h2 className="font-display text-3xl font-semibold text-charcoal mb-3">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-sm">
          Looks like you haven't added anything yet. Explore our collection and find something you love.
        </p>
        <Link to="/shop" className="btn-primary px-10">
          Browse Shop
        </Link>
      </div>
    );
  }

  const shipping = totalPrice > 100 ? 0 : 10;
  const total = totalPrice + shipping;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl font-semibold">Shopping Cart</h1>
          <p className="text-gray-400 mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-600 hover:underline transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <div
              key={`${item._id}-${item.size}-${item.color}-${idx}`}
              className="bg-white border border-gray-100 p-5 flex gap-5 card-shadow animate-slide-up"
            >
              {/* Image */}
              <Link to={`/product/${item._id}`} className="flex-shrink-0">
                <div className="w-24 h-32 bg-gray-50 overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/product/${item._id}`}
                    className="font-medium text-charcoal hover:text-primary-600 transition-colors leading-tight line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item._id, item.size, item.color)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors ml-2"
                    title="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Size / Color badges */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.size && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 font-medium uppercase tracking-wide">
                      Size: {item.size}
                    </span>
                  )}
                  {item.color && (
                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5">
                      <span
                        className="w-3 h-3 rounded-full border border-gray-300 inline-block"
                        style={{ background: item.color }}
                      />
                      {item.color}
                    </span>
                  )}
                </div>

                {/* Price + Quantity row */}
                <div className="flex items-center justify-between mt-4">
                  {/* Quantity stepper */}
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      −
                    </button>
                    <span className="w-10 h-9 flex items-center justify-center text-sm font-medium border-x border-gray-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-lg hover:bg-gray-50 transition-colors text-gray-500"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <p className="font-display text-lg font-semibold text-charcoal">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        ${item.price.toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-charcoal transition-colors group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 p-6 card-shadow sticky top-24">
            <h2 className="font-display text-2xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? <span className="text-green-600 font-medium">FREE</span>
                    : `$${shipping.toFixed(2)}`
                  }
                </span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-primary-500 bg-primary-50 px-3 py-2">
                  Add ${(100 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-display text-lg font-semibold">Total</span>
                <span className="font-display text-2xl font-bold text-charcoal">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full text-center block mt-6 py-4"
            >
              Proceed to Checkout
            </Link>

            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: '🔒', label: 'Secure Payment' },
                { icon: '↩️', label: 'Easy Returns' },
                { icon: '🚚', label: 'Fast Delivery' },
              ].map(b => (
                <div key={b.label}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p className="text-xs text-gray-400 leading-tight">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-display text-xl font-semibold">
            Your Cart {totalItems > 0 && <span className="text-primary-500">({totalItems})</span>}
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <p className="text-gray-400 font-medium">Your cart is empty</p>
              <button onClick={() => setIsOpen(false)} className="mt-4 text-sm text-primary-500 hover:underline">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4 border-b border-gray-50">
                  <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                    <div className="flex gap-2 mt-1">
                      {item.size && <span className="text-xs text-gray-400 uppercase">Size: {item.size}</span>}
                      {item.color && <span className="text-xs text-gray-400">• {item.color}</span>}
                    </div>
                    <p className="text-primary-600 font-semibold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200">
                        <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-1 text-sm hover:bg-gray-50 transition-colors">−</button>
                        <span className="px-3 py-1 text-sm border-x border-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-1 text-sm hover:bg-gray-50 transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item._id, item.size, item.color)}
                        className="text-red-400 hover:text-red-600 transition-colors text-xs">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping calculated at checkout</p>
            <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center block text-sm">
              Proceed to Checkout
            </Link>
            <button onClick={() => setIsOpen(false)} className="w-full text-center text-sm text-gray-500 hover:text-charcoal transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
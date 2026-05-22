import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, size = '', color = '') => {
    setCart(prev => {
      const key = `${product._id}-${size}-${color}`;
      const existing = prev.find(i => `${i._id}-${i.size}-${i.color}` === key);
      if (existing) {
        toast.success('Quantity updated!');
        return prev.map(i =>
          `${i._id}-${i.size}-${i.color}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      toast.success('Added to cart!');
      return [...prev, { ...product, quantity, size, color }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id, size, color) => {
    setCart(prev => prev.filter(i => !(i._id === id && i.size === size && i.color === color)));
  };

  const updateQuantity = (id, size, color, quantity) => {
    if (quantity < 1) return removeFromCart(id, size, color);
    setCart(prev =>
      prev.map(i =>
        i._id === id && i.size === size && i.color === color ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((a, i) => a + i.quantity, 0);
  const totalPrice = cart.reduce((a, i) => a + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      clearCart, totalItems, totalPrice, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
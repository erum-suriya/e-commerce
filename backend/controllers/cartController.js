const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper: find or create cart for user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name images price stock');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add item to cart (or increase qty if already exists)
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size = '', color = '' } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} units in stock` });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if same product+size+color combo already in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingIndex > -1) {
      // Update quantity
      cart.items[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.price,
        quantity,
        size,
        color
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Re-populate before sending back
    await cart.populate('items.product', 'name images price stock');
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update quantity of a specific cart item
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity, size = '', color = '' } = req.body;
    const { productId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1. Use DELETE to remove.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Validate stock
    const product = await Product.findById(productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} units in stock` });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate('items.product', 'name images price stock');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Remove a specific item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size = '', color = '' } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (item) =>
        !(item.product.toString() === productId &&
          item.size === size &&
          item.color === color)
    );

    if (cart.items.length === before) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    await cart.populate('items.product', 'name images price stock');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Sync frontend localStorage cart → DB cart (called on login)
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res) => {
  try {
    const { items } = req.body; // array from localStorage
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }

    const cart = await getOrCreateCart(req.user._id);

    for (const incoming of items) {
      const product = await Product.findById(incoming._id || incoming.product);
      if (!product) continue;

      const key = {
        productId: product._id.toString(),
        size: incoming.size || '',
        color: incoming.color || ''
      };

      const existingIndex = cart.items.findIndex(
        (i) =>
          i.product.toString() === key.productId &&
          i.size === key.size &&
          i.color === key.color
      );

      if (existingIndex > -1) {
        // Merge quantities
        cart.items[existingIndex].quantity += incoming.quantity || 1;
      } else {
        cart.items.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          price: product.price,
          quantity: incoming.quantity || 1,
          size: key.size,
          color: key.color
        });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.product', 'name images price stock');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
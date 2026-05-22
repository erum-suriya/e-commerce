const router = require('express').Router();
const {
  getCart, addToCart, updateCartItem,
  removeFromCart, clearCart, syncCart
} = require('../controllers/cartController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');

router.use(protect);

router.get('/all', adminOnly, async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images price');
    res.json(carts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/',             getCart);
router.post('/',            addToCart);
router.post('/sync',        syncCart);
router.put('/:productId',   updateCartItem);
router.delete('/',          clearCart);
router.delete('/:productId',removeFromCart);

module.exports = router;
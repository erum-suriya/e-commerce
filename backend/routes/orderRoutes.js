const router = require('express').Router();
const {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

router.post('/',              protect,            createOrder);
router.get('/my',             protect,            getMyOrders);
router.get('/all',            protect, adminOnly, getAllOrders);
router.get('/stats',          protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find();
    const revenue = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((s, o) => s + o.totalPrice, 0);

    const byStatus = {};
    ['processing','confirmed','shipped','delivered','cancelled'].forEach(s => {
      byStatus[s] = orders.filter(o => o.orderStatus === s).length;
    });

    // Revenue by month (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      const total = orders
        .filter(o => {
          const od = new Date(o.createdAt);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
            && o.orderStatus !== 'cancelled';
        })
        .reduce((s, o) => s + o.totalPrice, 0);
      months.push({ label, total });
    }

    res.json({ total: orders.length, revenue, byStatus, monthly: months });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id',            protect,            getOrderById);
router.put('/:id/status',     protect, adminOnly, updateOrderStatus);

// User cancel request
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    if (['shipped','delivered'].includes(order.orderStatus))
      return res.status(400).json({ message: 'Cannot cancel — order already shipped' });
    order.orderStatus = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: mark payment + trigger shipment
router.put('/:id/ship', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.orderStatus = 'shipped';
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
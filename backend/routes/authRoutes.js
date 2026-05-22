const router = require('express').Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// ── Admin: get all users ──────────────────────────────────────────
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role && role !== 'all') query.role = role;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: get single user ────────────────────────────────────────
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: update user role ───────────────────────────────────────
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { role, name, email } = req.body;
    // Prevent removing last admin
    if (role === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      const target = await User.findById(req.params.id);
      if (adminCount <= 1 && target.role === 'admin')
        return res.status(400).json({ message: 'Cannot remove the only admin' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id, { role, name, email }, { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Admin: delete user ────────────────────────────────────────────
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1)
        return res.status(400).json({ message: 'Cannot delete the only admin' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
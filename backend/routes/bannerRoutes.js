const router = require('express').Router();
const {
  getBanners, getAllBanners, createBanner,
  updateBanner, toggleBanner, deleteBanner, reorderBanners
} = require('../controllers/bannerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.get('/', getBanners);

// Admin only
router.get('/all',          protect, adminOnly, getAllBanners);
router.post('/',            protect, adminOnly, createBanner);
router.put('/reorder',      protect, adminOnly, reorderBanners);
router.put('/:id',          protect, adminOnly, updateBanner);
router.patch('/:id/toggle', protect, adminOnly, toggleBanner);
router.delete('/:id',       protect, adminOnly, deleteBanner);

module.exports = router;
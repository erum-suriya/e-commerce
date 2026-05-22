const Banner = require('../models/Banner');

// Public: get active banners (optionally filter by position)
exports.getBanners = async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date();
    const query = {
      active: true,
      $or: [
        { startDate: null },
        { startDate: { $lte: now } }
      ],
      $and: [
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };
    if (position) query.position = position;
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin: get ALL banners including inactive
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1, order: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    banner.active = !banner.active;
    await banner.save();
    res.json(banner);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.reorderBanners = async (req, res) => {
  try {
    // req.body = [{ id, order }, ...]
    const updates = req.body;
    await Promise.all(
      updates.map(({ id, order }) =>
        Banner.findByIdAndUpdate(id, { order })
      )
    );
    res.json({ message: 'Reordered' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
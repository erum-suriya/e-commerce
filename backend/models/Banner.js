const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subtitle:    { type: String, default: '' },
  description: { type: String, default: '' },
  buttonText:  { type: String, default: 'Shop Now' },
  buttonLink:  { type: String, default: '/shop' },
  imageUrl:    { type: String, required: true },
  position:    {
    type: String,
    enum: ['hero', 'home_top', 'home_mid', 'home_bottom',
           'sale_strip', 'announcement', 'category_men',
           'category_women', 'category_kids', 'category_accessories'],
    required: true
  },
  bgColor:     { type: String, default: '#1a1a2e' },
  textColor:   { type: String, default: '#ffffff' },
  order:       { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  startDate:   { type: Date, default: null },
  endDate:     { type: Date, default: null },
  badgeText:   { type: String, default: '' },
  fullWidth:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
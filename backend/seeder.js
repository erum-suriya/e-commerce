const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Banner = require('./models/Banner');

const banners = [
  {
    title: 'Eid. Eat. Repeat.',
    subtitle: 'New Eid Collection',
    description: 'Celebrate in style with our most sought-after festive looks.',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400',
    position: 'hero',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    order: 1, active: true,
    badgeText: 'New Eid Collection',
  },
  {
    title: 'Summer Sale',
    subtitle: 'Up to 40% Off',
    description: "Don't miss our biggest sale of the season.",
    buttonText: 'Shop the Sale',
    buttonLink: '/shop?sale=true',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400',
    position: 'home_mid',
    bgColor: '#d4841f',
    textColor: '#ffffff',
    order: 1, active: true,
    badgeText: 'Limited Time',
  },
  {
    title: 'FREE SHIPPING ON ORDERS OVER $100  •  NEW EID COLLECTION NOW LIVE  •  USE CODE LUXE10 FOR 10% OFF  •  EASY 30-DAY RETURNS',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    imageUrl: '',
    position: 'announcement',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    order: 1, active: true,
  },
  {
    title: 'Women',
    subtitle: 'Elegant & Modern',
    description: '',
    buttonText: 'Shop Women',
    buttonLink: '/shop?category=women',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
    position: 'category_women',
    order: 1, active: true,
  },
  {
    title: 'Men',
    subtitle: 'Classic & Bold',
    description: '',
    buttonText: 'Shop Men',
    buttonLink: '/shop?category=men',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600',
    position: 'category_men',
    order: 2, active: true,
  },
  {
    title: 'Kids',
    subtitle: 'Fun & Playful',
    description: '',
    buttonText: 'Shop Kids',
    buttonLink: '/shop?category=kids',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600',
    position: 'category_kids',
    order: 3, active: true,
  },
  {
    title: 'Accessories',
    subtitle: 'Complete the Look',
    description: '',
    buttonText: 'Shop Accessories',
    buttonLink: '/shop?category=accessories',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    position: 'category_accessories',
    order: 4, active: true,
  },
  {
    title: 'Eid Special',
    subtitle: 'Shop the Latest Arrivals',
    description: 'Handpicked festive styles just for you.',
    buttonText: 'Explore Now',
    buttonLink: '/shop?category=women',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400',
    position: 'home_top',
    bgColor: '#1a1a2e',
    textColor: '#ffffff',
    order: 1, active: true,
  },
];

// In your seedDB function add:
// await Banner.deleteMany({});
// await Banner.insertMany(banners);
// console.log(`🌱 Seeded ${banners.length} banners`);

dotenv.config();

const products = [
  {
    name: 'Classic White Oxford Shirt',
    description: 'A timeless white oxford shirt crafted from premium 100% cotton. Perfect for both formal and casual occasions.',
    price: 59.99,
    originalPrice: 89.99,
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#ffffff', '#87CEEB', '#000000'],
    stock: 50,
    images: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500'],
    featured: true,
    newArrival: true,
    rating: 4.5,
    numReviews: 12
  },
  {
    name: 'Slim Fit Dark Denim Jeans',
    description: 'Modern slim fit jeans in a rich dark indigo wash. Versatile and comfortable for everyday wear.',
    price: 79.99,
    originalPrice: 110.00,
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#1a237e', '#212121', '#546e7a'],
    stock: 35,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'],
    featured: true,
    newArrival: false,
    rating: 4.3,
    numReviews: 8
  },
  {
    name: 'Floral Wrap Midi Dress',
    description: 'A beautiful floral wrap dress with a flattering silhouette. Ideal for brunches, garden parties, or date nights.',
    price: 89.99,
    originalPrice: 129.99,
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#e91e63', '#ff9800', '#4caf50'],
    stock: 28,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
    featured: true,
    newArrival: true,
    rating: 4.8,
    numReviews: 20
  },
  {
    name: 'High-Waist Tailored Trousers',
    description: 'Elegant high-waist trousers with a clean tailored cut. A wardrobe staple that pairs with everything.',
    price: 69.99,
    originalPrice: 95.00,
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#212121', '#795548', '#607d8b'],
    stock: 40,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4c48?w=500'],
    featured: true,
    newArrival: false,
    rating: 4.2,
    numReviews: 6
  },
  {
    name: 'Oversized Graphic Hoodie',
    description: 'Super soft oversized hoodie with a bold graphic print. A streetwear essential for any casual look.',
    price: 49.99,
    originalPrice: 65.00,
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#9e9e9e', '#000000', '#f44336'],
    stock: 60,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500'],
    featured: false,
    newArrival: true,
    rating: 4.6,
    numReviews: 15
  },
  {
    name: 'Linen Blazer',
    description: 'Lightweight linen blazer perfect for summer events. Breathable fabric with a sharp, modern cut.',
    price: 119.99,
    originalPrice: 160.00,
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#f5f5dc', '#d2b48c', '#000000'],
    stock: 20,
    images: ['https://images.unsplash.com/photo-1548778052-311f4bc2b502?w=500'],
    featured: true,
    newArrival: true,
    rating: 4.7,
    numReviews: 9
  },
  {
    name: 'Kids Dino Print T-Shirt',
    description: 'Fun and colourful dinosaur print tee made from soft organic cotton. Kids absolutely love it!',
    price: 19.99,
    originalPrice: 27.00,
    category: 'kids',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#4caf50', '#ff9800', '#2196f3'],
    stock: 80,
    images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500'],
    featured: false,
    newArrival: true,
    rating: 4.9,
    numReviews: 25
  },
  {
    name: 'Kids Rainbow Joggers',
    description: 'Comfortable rainbow stripe joggers made from soft fleece. Great for play, school, or lounging.',
    price: 24.99,
    originalPrice: 34.99,
    category: 'kids',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['#e91e63', '#9c27b0', '#03a9f4'],
    stock: 55,
    images: ['https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500'],
    featured: false,
    newArrival: false,
    rating: 4.4,
    numReviews: 11
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Compact genuine leather crossbody bag with adjustable strap and multiple compartments.',
    price: 99.99,
    originalPrice: 149.99,
    category: 'accessories',
    sizes: [],
    colors: ['#5d4037', '#212121', '#f5f5dc'],
    stock: 15,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
    featured: true,
    newArrival: false,
    rating: 4.6,
    numReviews: 18
  },
  {
    name: 'Classic Aviator Sunglasses',
    description: 'Iconic aviator-style sunglasses with UV400 protection and gold metal frame.',
    price: 39.99,
    originalPrice: 55.00,
    category: 'accessories',
    sizes: [],
    colors: ['#ffd700', '#c0c0c0', '#000000'],
    stock: 45,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
    featured: true,
    newArrival: true,
    rating: 4.3,
    numReviews: 7
  },
  {
    name: 'Ribbed Knit Turtleneck',
    description: 'Cozy ribbed knit turtleneck sweater in a relaxed fit. Perfect layering piece for cooler days.',
    price: 54.99,
    originalPrice: 75.00,
    category: 'women',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#f5f5dc', '#d2691e', '#000000', '#808080'],
    stock: 32,
    images: ['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500'],
    featured: false,
    newArrival: true,
    rating: 4.5,
    numReviews: 14
  },
  {
    name: 'Chino Shorts',
    description: 'Smart casual chino shorts in a mid-length cut. Lightweight cotton twill, ideal for warm weather.',
    price: 34.99,
    originalPrice: 45.00,
    category: 'men',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['#d2b48c', '#808080', '#1a237e'],
    stock: 48,
    images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500'],
    featured: false,
    newArrival: false,
    rating: 4.1,
    numReviews: 5
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Product.insertMany(products);
    console.log(`🌱 Seeded ${products.length} products successfully!`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();
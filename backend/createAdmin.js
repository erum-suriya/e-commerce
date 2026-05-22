const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email    = process.argv[2];
    const password = process.argv[3];
    const name     = process.argv[4] || 'Admin';

    if (!email || !password) {
      console.log('❌ Usage: node createAdmin.js <email> <password> <name>');
      console.log('   Example: node createAdmin.js admin@luxe.com Admin123 "Super Admin"');
      process.exit(1);
    }

    // Check if user already exists
    const existing = await User.findOne({ email });

    if (existing) {
      // Just upgrade to admin
      existing.role = 'admin';
      await existing.save();
      console.log(`✅ "${existing.name}" (${email}) upgraded to ADMIN`);
    } else {
      // Create brand new admin user
      const admin = await User.create({ name, email, password, role: 'admin' });
      console.log(`✅ New admin created: ${admin.name} (${email})`);
    }

    console.log('\n🎉 Done! Login at http://localhost:5173/login');
    console.log('   Then go to http://localhost:5173/admin');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createAdmin();
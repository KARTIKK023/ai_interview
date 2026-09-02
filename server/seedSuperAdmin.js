const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully.');

    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@hiresmart.ai').toLowerCase().trim();
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

    // Check if Super Admin already exists
    let existingAdmin = await User.findOne({
      $or: [
        { email: adminEmail },
        { role: 'SUPER_ADMIN' },
        { role: 'super_admin' }
      ]
    });

    if (existingAdmin) {
      console.log(`Super Admin user already exists: ${existingAdmin.email} (Role: ${existingAdmin.role})`);
      process.exit(0);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create Super Admin user
    const superAdmin = await User.create({
      fullName: 'HireSmart Super Admin',
      name: 'HireSmart Super Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true
    });

    console.log('\n===============================================================');
    console.log('      SUPER ADMIN CREATED SUCCESSFULLY IN MONGODB ATLAS        ');
    console.log('===============================================================');
    console.log(`  Email:    ${superAdmin.email}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     ${superAdmin.role}`);
    console.log('===============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed Super Admin:', err);
    process.exit(1);
  }
};

seedSuperAdmin();

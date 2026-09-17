const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const User = require('./models/User');
const SuperAdmin = require('./models/SuperAdmin');

dotenv.config({ path: path.join(__dirname, '.env') });

const migrateSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing in .env');

    await mongoose.connect(mongoUri);

    const source = await User.findOne({
      $or: [
        { role: 'SUPER_ADMIN' },
        { role: 'super_admin' }
      ]
    }).select('+password').lean();

    if (!source) {
      const existingTarget = await SuperAdmin.findOne({ role: 'SUPER_ADMIN' }).select('_id email').lean();
      if (existingTarget) {
        console.log(`Migration already completed for ${existingTarget.email}.`);
        return;
      }
      throw new Error('No existing Super Admin was found in users and no superadmins record exists. Nothing was migrated.');
    }

    let target = await SuperAdmin.findOne({
      $or: [{ _id: source._id }, { email: source.email }]
    }).select('+password');

    if (!target) {
      const { _id, __v, ...sourceFields } = source;
      target = new SuperAdmin({
        ...sourceFields,
        _id: source._id,
        role: 'SUPER_ADMIN',
        fullName: source.fullName || source.name,
        name: source.name || source.fullName
      });
      await target.save();
    }

    const verifiedTarget = await SuperAdmin.findOne({ _id: source._id, role: 'SUPER_ADMIN' }).select('+password').lean();
    const verified = Boolean(
      verifiedTarget &&
      verifiedTarget.email === source.email &&
      verifiedTarget.password === source.password &&
      verifiedTarget.role === 'SUPER_ADMIN'
    );

    if (!verified) {
      throw new Error('Migration verification failed. The users record was kept unchanged.');
    }

    const deleteResult = await User.deleteOne({
      _id: source._id,
      role: { $in: ['SUPER_ADMIN', 'super_admin'] },
      email: source.email
    });

    if (deleteResult.deletedCount !== 1) {
      throw new Error('The new superadmins record was verified, but the original users record was not removed. Review manually.');
    }

    console.log(`Migrated Super Admin ${source.email} to superadmins and removed the verified users record.`);
  } catch (error) {
    console.error('Super Admin migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateSuperAdmin();

const User = require('../models/User');

const PURPOSE_FLAGS = {
  MOCK_LEVELS: { mockLevelsUnlocked: true, mockLevelsUnlockedAt: new Date() },
  ATS_PRO: { atsProUnlocked: true, atsProUnlockedAt: new Date() },
  SUPER_PACK: {
    mockLevelsUnlocked: true,
    mockLevelsUnlockedAt: new Date(),
    atsProUnlocked: true,
    atsProUnlockedAt: new Date()
  }
};

const grantEntitlement = async ({ student, purpose }) => {
  const updates = PURPOSE_FLAGS[purpose] || {};
  if (!Object.keys(updates).length) return null;

  updates.accessUnlocked = true;
  updates.unlockedAt = new Date();

  const user = await User.findByIdAndUpdate(student, { $set: updates }, { new: true });
  return user;
};

module.exports = { grantEntitlement, PURPOSE_FLAGS };
const bcrypt = require('bcryptjs');
const Category = require('../models/Category');
const User = require('../models/User');

const defaultExpense = [
  { name: 'Food', type: 'EXPENSE', icon: 'utensils', color: '#F59E0B' },
  { name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag', color: '#EC4899' },
  { name: 'Transportation', type: 'EXPENSE', icon: 'car', color: '#3B82F6' },
  { name: 'Rent', type: 'EXPENSE', icon: 'home', color: '#8B5CF6' },
  { name: 'Bills and Utilities', type: 'EXPENSE', icon: 'zap', color: '#10B981' },
  { name: 'Healthcare', type: 'EXPENSE', icon: 'heart-pulse', color: '#EF4444' },
  { name: 'Education', type: 'EXPENSE', icon: 'graduation-cap', color: '#6366F1' },
  { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#F97316' },
  { name: 'Travel', type: 'EXPENSE', icon: 'plane', color: '#06B6D4' },
  { name: 'Other', type: 'EXPENSE', icon: 'tag', color: '#A3A3A3' }
];

const defaultIncome = [
  { name: 'Salary', type: 'INCOME', icon: 'wallet', color: '#10B981' },
  { name: 'Freelancing', type: 'INCOME', icon: 'laptop', color: '#3B82F6' },
  { name: 'Business', type: 'INCOME', icon: 'briefcase', color: '#8B5CF6' },
  { name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#F59E0B' },
  { name: 'Gifts', type: 'INCOME', icon: 'gift', color: '#EC4899' },
  { name: 'Other Income', type: 'INCOME', icon: 'dollar-sign', color: '#A3A3A3' }
];

async function seedInitialData() {
  try {
    // 1. Initialize system categories
    for (const cat of [...defaultExpense, ...defaultIncome]) {
      const exists = await Category.findOne({
        name: { $regex: new RegExp(`^${cat.name}$`, 'i') },
        isSystem: true
      });
      if (!exists) {
        await Category.create({
          userId: null,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isSystem: true,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`[Seed] Initialized system category: ${cat.name} (${cat.type})`);
      }
    }

    // 2. Initialize default admin if not exists
    const adminEmail = (process.env.ADMIN_DEFAULT_EMAIL || 'admin@aurafinance.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        fullName: 'AURA System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'ROLE_ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`[Seed] Administrator account successfully initialized: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`[Seed] Error during database initialization: ${error.message}`);
  }
}

module.exports = seedInitialData;

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./database');
const { User, Role } = require('../models');

const seed = async () => {
  try {
    console.log('🔄 Starting database seeding...', process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD);
    await sequelize.authenticate();
     console.log('✅ Database connection established for seeding1');
    await sequelize.sync({ alter: true });

    // Create roles
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { description: 'Full system access' } });
    const [managerRole] = await Role.findOrCreate({ where: { name: 'manager' }, defaults: { description: 'Manage resources' } });
    const [userRole] = await Role.findOrCreate({ where: { name: 'user' }, defaults: { description: 'Basic access' } });

    console.log('✅ Roles seeded');

    // Create admin user
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const [admin] = await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: adminRole.id,
      },
    });

    const [manager] = await User.findOrCreate({
      where: { email: 'manager@example.com' },
      defaults: {
        name: 'Manager User',
        email: 'manager@example.com',
        password: await bcrypt.hash('Manager@123', salt),
        roleId: managerRole.id,
      },
    });

    const [user] = await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: {
        name: 'Regular User',
        email: 'user@example.com',
        password: await bcrypt.hash('User@123', salt),
        roleId: userRole.id,
      },
    });

    console.log('✅ Users seeded');
    console.log('\n--- Seed Credentials ---');
    console.log('Admin   → admin@example.com    / Admin@123');
    console.log('Manager → manager@example.com  / Manager@123');
    console.log('User    → user@example.com     / User@123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();

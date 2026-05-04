const { Sequelize } = require('sequelize');
const { DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, NODE_ENV } = require('./app.config');

const sequelize = new Sequelize(
  DB_NAME,
  DB_USERNAME,
  DB_PASSWORD,
  {
    host: DB_HOST,
    port: Number(DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    timezone: 'Asia/Kolkata',
  }
);

const connectDB = async () => {
  try {
    console.log('✅ Database connection established for seeding-', NODE_ENV);
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully-', NODE_ENV);

    // Sync all models (alter: true updates columns without dropping data)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'dev' });
    console.log('✅ Database models synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

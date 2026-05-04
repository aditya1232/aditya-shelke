const { sequelize } = require('../config/database');
const Role = require('./role.model');
const User = require('./user.model');

// Associations
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

module.exports = { sequelize, Role, User };

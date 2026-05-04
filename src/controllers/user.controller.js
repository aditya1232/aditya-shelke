const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/users
 * Admin only — List all users with their roles
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    const include = [{ model: Role, as: 'role', attributes: ['name'] }];

    // Filter by role if provided
    if (role) {
      include[0].where = { name: role };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Users fetched.', {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      users,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Admin, Manager — Get single user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, 'User fetched.', user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id
 * Admin only — Update user details
 */
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const { name, email, roleId, isActive } = req.body;

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const duplicate = await User.findOne({ where: { email } });
      if (duplicate) {
        return errorResponse(res, 'Email already in use.', 409);
      }
    }

    await user.update({ name, email, roleId, isActive });

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    return successResponse(res, 'User updated.', updated);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only — Soft delete (deactivate) a user
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    // Prevent self-deletion
    if (user.id === req.user.id) {
      return errorResponse(res, 'You cannot deactivate your own account.', 400);
    }

    await user.update({ isActive: false });
    return successResponse(res, 'User deactivated successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };

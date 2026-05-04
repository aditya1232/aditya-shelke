const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * POST /api/auth/register
 * Public — Register a new user (default role: user)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email is already registered.', 409);
    }

    // Get default 'user' role
    const role = await Role.findOne({ where: { name: 'user' } });
    if (!role) {
      return errorResponse(res, 'Default role not found. Run db:seed first.', 500);
    }

    // Hash password
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: role.id,
    });

    const token = generateToken({ id: user.id, email: user.email, role: role.name });

    return successResponse(
      res,
      'Registration successful.',
      { token, user: { id: user.id, name: user.name, email: user.email, role: role.name } },
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Public — Login with email & password, returns JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Use scope to include password for comparison
    const user = await User.scope('withPassword').findOne({
      where: { email, isActive: true },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role.name });

    return successResponse(res, 'Login successful.', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected — Get current logged-in user profile
 */
const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, 'Profile fetched.', {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role.name,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };

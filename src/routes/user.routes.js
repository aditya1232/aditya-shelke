const express = require('express');
const router = express.Router();
const Joi = require('joi');

const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');

// --- Validation Schemas ---

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  roleId: Joi.number().integer().positive(),
  isActive: Joi.boolean(),
}).min(1); // at least one field required

// All user routes require authentication
router.use(authenticate);

// GET /api/users             — admin only
router.get('/', authorize('admin'), getAllUsers);

// GET /api/users/:id         — admin, manager
router.get('/:id', authorize('admin', 'manager'), getUserById);

// PUT /api/users/:id         — admin only
router.put('/:id', authorize('admin'), validate(updateUserSchema), updateUser);

// DELETE /api/users/:id      — admin only
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;

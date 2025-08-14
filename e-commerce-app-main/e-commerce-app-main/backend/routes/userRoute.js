const express = require('express');
const route = express.Router();
const { authenticateToken, checkOwnership, requireRole } = require('../middleware/auth');
const { getUser, getUsers, patchUser, deleteUser, getUserProfile } = require('../controllers/userLogic');

route.get('/profile', authenticateToken, getUserProfile);

route.get('/', authenticateToken, requireRole(['admin']), getUsers);

route.get('/:id', authenticateToken, checkOwnership, getUser);

route.patch('/:id', authenticateToken, checkOwnership, patchUser);

route.delete('/:id', authenticateToken, checkOwnership, deleteUser);

module.exports = route;
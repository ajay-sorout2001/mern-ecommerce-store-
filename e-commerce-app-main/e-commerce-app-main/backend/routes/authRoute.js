const express = require('express');
const route = express.Router();
const { signup, login, logout, changePassword, changeEmail, getCurrentUser } = require('../controllers/authLogic');
const { authenticateToken } = require('../middleware/auth');

route.post('/signup', signup);
route.post('/login', login);
route.post('/logout', logout);
route.get('/me', authenticateToken, getCurrentUser);
route.patch('/change-password', authenticateToken, changePassword);
route.patch('/change-email', authenticateToken, changeEmail);

module.exports = route;

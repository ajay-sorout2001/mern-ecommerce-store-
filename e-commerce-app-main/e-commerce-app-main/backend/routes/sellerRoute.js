const express = require('express');
const route = express.Router();
const { authenticateToken, checkOwnership, requireRole } = require('../middleware/auth');
const { getSeller, getSellers, patchSeller, deleteSeller, getSellerProfile, getSellerStats, getSellerProducts } = require('../controllers/sellerLogic');

route.get('/profile', authenticateToken, requireRole(['seller']), getSellerProfile);
route.get('/stats', authenticateToken, requireRole(['seller']), getSellerStats);
route.get('/products', authenticateToken, requireRole(['seller']), getSellerProducts);

route.get('/', authenticateToken, requireRole(['admin']), getSellers);
route.get('/:id', authenticateToken, checkOwnership, getSeller);
route.patch('/:id', authenticateToken, checkOwnership, patchSeller);
route.delete('/:id', authenticateToken, checkOwnership, deleteSeller);

module.exports = route;

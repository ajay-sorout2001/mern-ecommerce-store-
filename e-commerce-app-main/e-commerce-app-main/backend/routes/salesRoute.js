const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, checkSaleAccess } = require('../middleware/auth');
const {
    createSale,
    getSale,
    getSales,
    getSalesByBrand,
    getSellerSales,
    getBuyerSales,
    updateSaleStatus,
    deleteSale
} = require('../controllers/salesLogic');

// Public routes
router.get('/brand/:brandName', getSalesByBrand);

// User routes (buyers)
router.post('/', authenticateToken, requireRole(['user']), createSale);
router.get('/my-purchases', authenticateToken, requireRole(['user']), getBuyerSales);

// Seller routes
router.get('/my-sales', authenticateToken, requireRole(['seller']), getSellerSales);
router.patch('/:id/status', authenticateToken, requireRole(['seller', 'admin']), updateSaleStatus);

// Protected routes with access control
router.get('/:id', authenticateToken, checkSaleAccess, getSale);

// Admin routes
router.get('/', authenticateToken, requireRole(['admin']), getSales);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteSale);

module.exports = router;

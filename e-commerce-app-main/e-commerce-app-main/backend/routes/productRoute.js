const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, checkProductOwnership } = require('../middleware/auth');
const {
    addProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getSellerProducts
} = require('../controllers/productLogic');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Seller-only routes  
router.post('/', authenticateToken, requireRole(['seller']), addProduct);
router.patch('/:id', authenticateToken, requireRole(['seller']), checkProductOwnership, updateProduct);
router.delete('/:id', authenticateToken, requireRole(['seller']), checkProductOwnership, deleteProduct);
router.get('/seller/my-products', authenticateToken, requireRole(['seller']), getSellerProducts);

module.exports = router;

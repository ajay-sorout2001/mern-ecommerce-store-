const jwt = require("jsonwebtoken");
const User = require("../models/userSchema.js");
const Seller = require("../models/sellerSchema.js");

// Cookie-first authentication with header fallback
const authenticateToken = async (req, res, next) => {
    let token = req.cookies?.authToken;

    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user account still exists
        let userExists;
        if (decoded.role === 'user') {
            userExists = await User.findById(decoded.userId);
        } else if (decoded.role === 'seller') {
            userExists = await Seller.findById(decoded.userId);
        }

        if (!userExists) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists'
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};

// User resource ownership verification
const checkOwnership = async (req, res, next) => {
    try {
        const targetUserId = req.params.id || req.params.userId;

        if (req.user.userId === targetUserId || req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access your own resources'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization check failed',
            error: error.message
        });
    }
};

// Product ownership verification for sellers
const checkProductOwnership = async (req, res, next) => {
    try {
        const productId = req.params.id;
        const sellerId = req.user.userId;

        const Product = require("../models/productSchema");
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.seller.toString() === sellerId || req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only modify your own products'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Product ownership check failed',
            error: error.message
        });
    }
};

// Sale access verification (buyer, seller, or admin)
const checkSaleAccess = async (req, res, next) => {
    try {
        const saleId = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;

        if (userRole === 'admin') {
            return next();
        }

        const Sale = require("../models/salesSchema");
        const sale = await Sale.findById(saleId);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Sale not found'
            });
        }

        // Allow if user is the buyer or seller of this sale
        if (sale.buyer.toString() === userId || sale.seller.toString() === userId) {
            next();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Access denied: You can only access sales you are involved in'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Sale access check failed',
            error: error.message
        });
    }
};

module.exports = { authenticateToken, requireRole, checkOwnership, checkProductOwnership, checkSaleAccess };

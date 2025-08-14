const Seller = require("../models/sellerSchema");
const Product = require("../models/productSchema");

const getSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const seller = await Seller.findById(sellerId)
            .select('-password')
            .populate('products', 'title price category');

        return res.status(200).json({
            success: true,
            data: seller
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get seller',
            error: error.message
        });
    }
};

const getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({})
            .select('-password')
            .populate('products', 'title price category')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: sellers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get sellers',
            error: error.message
        });
    }
};

const patchSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const updateData = req.body;

        // Prevent updating sensitive fields
        delete updateData.password;
        delete updateData.email;
        delete updateData._id;
        delete updateData.__v;
        delete updateData.products;

        const seller = await Seller.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password').populate('products', 'title price category');

        return res.status(200).json({
            success: true,
            message: 'Seller updated successfully',
            data: seller
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to update seller',
            error: error.message
        });
    }
};

const deleteSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;

        // First, delete all products associated with this seller
        await Product.deleteMany({ seller: sellerId });

        const seller = await Seller.findByIdAndDelete(sellerId);

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Seller and associated products deleted successfully',
            data: {
                deletedSellerId: sellerId
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete seller',
            error: error.message
        });
    }
};

const getSellerProfile = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const seller = await Seller.findById(sellerId)
            .select('-password')
            .populate('products', 'title price category createdAt');

        return res.status(200).json({
            success: true,
            data: seller
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get seller profile',
            error: error.message
        });
    }
};

// Get seller dashboard stats
const getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const seller = await Seller.findById(sellerId).select('brandName products');
        const products = await Product.find({ seller: sellerId });

        const stats = {
            totalProducts: products.length,
            brandName: seller.brandName,
            productsByCategory: {},
            recentProducts: products
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(p => ({ title: p.title, price: p.price, createdAt: p.createdAt }))
        };

        // Group products by category
        products.forEach(product => {
            const category = product.category || 'Uncategorized';
            stats.productsByCategory[category] = (stats.productsByCategory[category] || 0) + 1;
        });

        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get seller stats',
            error: error.message
        });
    }
};

// Get seller's own products
const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.userId; // From auth middleware
        
        const products = await Product.find({ seller: sellerId })
            .populate('seller', 'username brandName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to get seller products',
            error: error.message
        });
    }
};

module.exports = {
    getSeller,
    getSellers,
    patchSeller,
    deleteSeller,
    getSellerProfile,
    getSellerStats,
    getSellerProducts
};
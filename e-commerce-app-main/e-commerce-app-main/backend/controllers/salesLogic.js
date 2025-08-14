const Sale = require("../models/salesSchema");
const Product = require("../models/productSchema");
const Seller = require("../models/sellerSchema");
const User = require("../models/userSchema");

// Create a new sale
const createSale = async (req, res) => {
    try {
        const buyerId = req.user.userId;
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "Product ID and quantity are required"
            });
        }

        // Get product details
        const product = await Product.findById(productId).populate('seller', 'brandName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const totalPrice = product.price * quantity;

        const saleData = {
            product: productId,
            seller: product.seller._id,
            buyer: buyerId,
            quantity,
            totalPrice,
            status: "pending"
        };

        const newSale = new Sale(saleData);
        await newSale.save();

        // Populate all references for response
        const populatedSale = await Sale.findById(newSale._id)
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email');

        return res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: populatedSale
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create sale",
            error: error.message
        });
    }
};

// Get single sale by ID
const getSale = async (req, res) => {
    try {
        const saleId = req.params.id;

        const sale = await Sale.findById(saleId)
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email');

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: sale
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get sale",
            error: error.message
        });
    }
};

// Get all sales (admin only)
const getSales = async (req, res) => {
    try {
        const sales = await Sale.find({})
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: sales
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get sales",
            error: error.message
        });
    }
};

// Get sales by brand name
const getSalesByBrand = async (req, res) => {
    try {
        const { brandName } = req.params;

        // Find seller by brand name
        const seller = await Seller.findOne({ brandName: brandName });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: "Brand not found"
            });
        }

        // Get all sales for this seller
        const sales = await Sale.find({ seller: seller._id })
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email')
            .sort({ createdAt: -1 });

        // Calculate sales statistics
        const stats = {
            brandName: seller.brandName,
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
            salesByStatus: {
                pending: sales.filter(s => s.status === 'pending').length,
                completed: sales.filter(s => s.status === 'completed').length,
                cancelled: sales.filter(s => s.status === 'cancelled').length
            },
            recentSales: sales.slice(0, 10)
        };

        return res.status(200).json({
            success: true,
            data: {
                sales,
                stats
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get sales by brand",
            error: error.message
        });
    }
};

// Get sales for current seller
const getSellerSales = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const sales = await Sale.find({ seller: sellerId })
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email')
            .sort({ createdAt: -1 });

        // Calculate seller statistics
        const stats = {
            totalSales: sales.length,
            totalRevenue: sales.reduce((sum, sale) => sum + sale.totalPrice, 0),
            salesByStatus: {
                pending: sales.filter(s => s.status === 'pending').length,
                completed: sales.filter(s => s.status === 'completed').length,
                cancelled: sales.filter(s => s.status === 'cancelled').length
            },
            topProducts: {}
        };

        // Calculate top-selling products
        sales.forEach(sale => {
            const productTitle = sale.product.title;
            stats.topProducts[productTitle] = (stats.topProducts[productTitle] || 0) + sale.quantity;
        });

        return res.status(200).json({
            success: true,
            data: {
                sales,
                stats
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get seller sales",
            error: error.message
        });
    }
};

// Get sales for current user (buyer)
const getBuyerSales = async (req, res) => {
    try {
        const buyerId = req.user.userId;

        const sales = await Sale.find({ buyer: buyerId })
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: sales
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get buyer sales",
            error: error.message
        });
    }
};

// Update sale status
const updateSaleStatus = async (req, res) => {
    try {
        const saleId = req.params.id;
        const { status } = req.body;

        if (!['pending', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, completed, or cancelled"
            });
        }

        const sale = await Sale.findById(saleId);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }

        // Only seller or admin can update sale status
        if (req.user.role !== 'admin' && sale.seller.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied: You can only update your own sales"
            });
        }

        const updatedSale = await Sale.findByIdAndUpdate(
            saleId,
            { status },
            { new: true }
        )
            .populate('product', 'title price category')
            .populate('seller', 'username brandName email')
            .populate('buyer', 'username firstName lastName email');

        return res.status(200).json({
            success: true,
            message: "Sale status updated successfully",
            data: updatedSale
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update sale status",
            error: error.message
        });
    }
};

// Delete sale (admin only)
const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.id;

        const sale = await Sale.findByIdAndDelete(saleId);

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: "Sale not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sale deleted successfully",
            data: {
                deletedSaleId: saleId
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete sale",
            error: error.message
        });
    }
};

module.exports = {
    createSale,
    getSale,
    getSales,
    getSalesByBrand,
    getSellerSales,
    getBuyerSales,
    updateSaleStatus,
    deleteSale
};
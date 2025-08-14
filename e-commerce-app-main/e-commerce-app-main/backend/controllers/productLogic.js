const Product = require("../models/productSchema");
const Seller = require("../models/sellerSchema");
const cloudinary = require('cloudinary').v2;

const uploadImageToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "product-images",
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto"
        });
        return result.secure_url;
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary');
    }
};

const addProduct = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { title, description, price, category } = req.body;

        if (!title || !price) {
            return res.status(400).json({
                success: false,
                message: "Title and price are required"
            });
        }

        let productImage = '';
        
        // Handle image upload
        if (req.files && req.files.productImage) {
            try {
                productImage = await uploadImageToCloudinary(req.files.productImage);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload product image"
                });
            }
        }

        const productData = {
            title,
            description,
            price,
            category,
            productImage,
            seller: sellerId
        };

        const newProduct = new Product(productData);
        await newProduct.save();

        // Add product to seller's products array
        await Seller.findByIdAndUpdate(
            sellerId,
            { $push: { products: newProduct._id } }
        );

        // Populate seller information for response
        const populatedProduct = await Product.findById(newProduct._id)
            .populate('seller', 'username brandName email');

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: populatedProduct
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create product",
            error: error.message
        });
    }
};

const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findById(productId)
            .populate('seller', 'username brandName email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get product",
            error: error.message
        });
    }
};

// API supports pagination, search, filtering, and sorting
const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;

        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'all') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sortBy]: sortOrder };

        const products = await Product.find(query)
            .populate('seller', 'username brandName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortObj);

        const total = await Product.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                },
                filters: { search, category, minPrice, maxPrice, sortBy, order }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get products",
            error: error.message
        });
    }
};

// Ownership verified by middleware
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updateData = { ...req.body };

        // Handle image upload if present
        if (req.files && req.files.productImage) {
            try {
                updateData.productImage = await uploadImageToCloudinary(req.files.productImage);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload product image"
                });
            }
        }

        // Prevent updating protected fields
        delete updateData._id;
        delete updateData.__v;
        delete updateData.seller;
        delete updateData.createdAt;

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('seller', 'username brandName email');

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
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
            message: "Failed to update product",
            error: error.message
        });
    }
};

// Ownership verified by middleware
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const sellerId = req.user.userId;

        // Remove product from seller's products array
        await Seller.findByIdAndUpdate(
            sellerId,
            { $pull: { products: productId } }
        );

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: {
                deletedProductId: productId
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
            error: error.message
        });
    }
};

// Seller dashboard API with pagination and search
const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.userId;
        const { page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        let query = { seller: sellerId };

        if (search) {
            query.$and = [
                { seller: sellerId },
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        const products = await Product.find(query)
            .populate('seller', 'username brandName email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get seller products",
            error: error.message
        });
    }
};

module.exports = {
    addProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getSellerProducts
};
import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Product Service
export const productService = {
    // Get all products with optional filters and pagination
    getProducts: async (params = {}) => {
        try {
            const response = await api.get('/product', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch products');
        }
    },

    // Get single product by ID
    getProduct: async (productId) => {
        try {
            const response = await api.get(`/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch product');
        }
    },

    // Search products
    searchProducts: async (searchTerm, filters = {}) => {
        try {
            const params = {
                search: searchTerm,
                ...filters
            };
            const response = await api.get('/product', { params });
            return response.data;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error(error.response?.data?.message || 'Failed to search products');
        }
    },

    // Get products by category
    getProductsByCategory: async (category, params = {}) => {
        try {
            const response = await api.get('/product', {
                params: { category, ...params }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch products by category');
        }
    },

    // Get filtered products
    getFilteredProducts: async (filters = {}) => {
        try {
            const response = await api.get('/product', { params: filters });
            return response.data;
        } catch (error) {
            console.error('Error fetching filtered products:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch filtered products');
        }
    }
};

export default productService;

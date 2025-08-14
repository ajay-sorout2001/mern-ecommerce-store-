import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SellerDashboard.css';

const SellerDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch seller's products
  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/seller/products`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchMyProducts();
    }
  }, [activeTab]);

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/product/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  // Edit product
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  // Add new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  return (
    <div className="seller-dashboard-overlay" onClick={onClose}>
      <div className="seller-dashboard" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-header">
          <h2>Seller Dashboard</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            My Listings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'listings' && (
            <div className="listings-tab">
              <div className="listings-header">
                <h3>Your Products ({products.length})</h3>
                <button className="add-product-btn" onClick={handleAddProduct}>
                  + Add Product
                </button>
              </div>

              {error && <div className="error-message">{error}</div>}

              {loading ? (
                <div className="loading">Loading products...</div>
              ) : (
                <div className="products-grid">
                  {products.length === 0 ? (
                    <div className="no-products">
                      <p>You haven't added any products yet.</p>
                      <button onClick={handleAddProduct}>Add Your First Product</button>
                    </div>
                  ) : (
                    products.map(product => (
                      <div key={product._id} className="product-card">
                        <div className="product-image">
                          {product.productImage ? (
                            <img src={product.productImage} alt={product.title} />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h4>{product.title}</h4>
                          <p className="product-price">${product.price}</p>
                          <p className="product-category">{product.category}</p>
                          <div className="product-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <h3>Sales Analytics</h3>
              <div className="analytics-cards">
                <div className="analytics-card">
                  <h4>Total Products</h4>
                  <p className="analytics-number">{products.length}</p>
                </div>
                <div className="analytics-card">
                  <h4>Total Revenue</h4>
                  <p className="analytics-number">$0.00</p>
                </div>
                <div className="analytics-card">
                  <h4>Orders</h4>
                  <p className="analytics-number">0</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
              setShowProductModal(false);
              setEditingProduct(null);
            }}
            onSuccess={() => {
              setShowProductModal(false);
              setEditingProduct(null);
              fetchMyProducts();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Product Modal Component for Add/Edit
const ProductModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'electronics'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.productImage || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = product 
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/product/${product._id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/product`;
      
      const method = product ? 'PUT' : 'POST';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Add image file if selected
      if (selectedImage) {
        formDataToSend.append('productImage', selectedImage);
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend // Don't set Content-Type header - let browser set it with boundary
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (error) {
      setError('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Product Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="electronics">Electronics</option>
                <option value="home">Home</option>
                <option value="beauty">Beauty</option>
                <option value="grocery">Grocery</option>
                <option value="lighting">Lighting</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="productImage">Product Image</label>
            <input
              type="file"
              id="productImage"
              name="productImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  style={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    marginTop: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerDashboard;

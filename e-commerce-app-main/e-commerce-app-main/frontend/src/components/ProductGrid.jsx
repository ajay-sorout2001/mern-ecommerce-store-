import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  loadingMore = false,
  error = null,
  pagination = null,
  onLoadMore = null 
}) => {
  if (loading && products.length === 0) {
    return (
      <div className="qc-loading">
        <div className="qc-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="qc-error">
        <p>Error: {error}</p>
        <button 
          className="qc-btn qc-btn-primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="qc-no-products">
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="qc-product-grid-container">
      <div className={`qc-product-grid ${loading ? 'loading' : ''}`}>
        {products.map((product) => (
          <ProductCard 
            key={product._id} 
            product={product} 
          />
        ))}
      </div>
      
      {loadingMore && products.length > 0 && (
        <div className="qc-loading-more">
          <div className="qc-spinner"></div>
          <p>Loading more products...</p>
        </div>
      )}
      
      {pagination && pagination.hasNext && !loadingMore && onLoadMore && (
        <div className="qc-load-more">
          <button 
            className="qc-btn qc-btn-outline"
            onClick={onLoadMore}
          >
            Load More Products
          </button>
        </div>
      )}
      
      {pagination && (
        <div className="qc-pagination-info">
          <p>
            Showing {products.length} of {pagination.totalProducts} products
            {pagination.totalPages > 1 && (
              <span> (Page {pagination.currentPage} of {pagination.totalPages})</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

import React from 'react';

const ProductCard = ({ product }) => {
  const {
    _id,
    title,
    price,
    category,
    productImage,
    seller
  } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="qc-product-card">
      <div className="qc-product-image">
        {productImage ? (
          <img 
            src={productImage} 
            alt={title}
            onError={(e) => {
              e.target.src = '/vite.svg'; // Fallback image
            }}
          />
        ) : (
          <div className="qc-no-image">
            <span>No Image</span>
          </div>
        )}
      </div>
      
      <div className="qc-product-info">
        <h3 className="qc-product-title">{title}</h3>
        
        <div className="qc-product-price">
          {formatPrice(price)}
        </div>
        
        {category && (
          <div className="qc-product-category">
            <span className="qc-category-tag">{category}</span>
          </div>
        )}
        
        {seller && (
          <div className="qc-seller-info">
            <span className="qc-seller-name">
              {seller.brandName || seller.username}
            </span>
          </div>
        )}
        
        <div className="qc-product-actions">
          <button className="qc-btn qc-btn-primary">
            View Details
          </button>
          <button className="qc-btn qc-btn-secondary">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

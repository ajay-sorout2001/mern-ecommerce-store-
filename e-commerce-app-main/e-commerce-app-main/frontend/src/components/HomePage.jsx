import React, { useState } from 'react';
import AuthModal from './SignupModal';
import ProductGrid from './ProductGrid';
import ProfileAvatar from './ProfileAvatar';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  // Fetch products with initial pagination
  const {
    products,
    loading,
    loadingMore,
    error,
    pagination,
    loadMore,
    searchProducts,
    filterProducts
  } = useProducts({ 
    page: 1, 
    limit: 12,
    sortBy: 'createdAt',
    order: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      await searchProducts(searchTerm, { 
        category: selectedCategory !== 'all' ? selectedCategory : undefined 
      });
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    await filterProducts({
      category: category !== 'all' ? category : undefined,
      page: 1,
      limit: 12
    });
  };

  return (
    <div className="qc-home">
      <header className="qc-header">
        <div className="qc-logo">QuickCart</div>
        <nav className="qc-nav">
          <a href="#">Home</a>
          <a href="#">Shop</a>
          <a href="#">Categories</a>
          <a href="#">Cart</a>
          {isAuthenticated ? (
            <ProfileAvatar user={user} onLogout={logout} />
          ) : (
            <button className="qc-signup-btn" onClick={() => setShowAuth(true)}>
              Sign up
            </button>
          )}
        </nav>
      </header>
      
      <section className="qc-hero">
        <h1>Discover unique handmade & vintage goods</h1>
        <p>Shop millions of one-of-a-kind items from creative sellers around the world.</p>
        {!isAuthenticated && (
          <button className="qc-cta" onClick={() => setShowAuth(true)}>
            Get Started
          </button>
        )}
      </section>
      
      {/* Search and Filter Section */}
      <section className="qc-search-section">
        <div className="qc-search-container">
          <form onSubmit={handleSearch} className="qc-search-form">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="qc-search-input"
            />
            <button type="submit" className="qc-search-btn">
              Search
            </button>
          </form>
          
          <div className="qc-category-filters">
            {['all', 'electronics', 'home', 'beauty', 'grocery', 'lighting'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`qc-category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      <section className="qc-featured">
        <div className="qc-featured-title">
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Products'}
        </div>
        
        <ProductGrid
          products={products}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          pagination={pagination}
          onLoadMore={loadMore}
        />
      </section>
      
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default HomePage;

import React, { useState, useRef, useEffect } from 'react';
import SellerDashboard from './SellerDashboard';
import './ProfileAvatar.css';

const ProfileAvatar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSellerDashboard, setShowSellerDashboard] = useState(false);
  const menuRef = useRef(null);

  // Get initials from user data
  const getInitials = () => {
    if (user.role === 'seller' && user.brandName) {
      // For sellers, use brand name initials (e.g., "Krish Shop" -> "KS")
      return user.brandName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
    } else if (user.firstName && user.lastName) {
      // For users, use first name + last name initials
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    } else if (user.username) {
      // Fallback to first two letters of username
      return user.username.substring(0, 2).toUpperCase();
    }
    return 'U'; // Ultimate fallback
  };

  // Get display name
  const getDisplayName = () => {
    if (user.role === 'seller' && user.brandName) {
      return user.brandName;
    } else if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.username) {
      return user.username;
    }
    return 'User';
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    setShowProfileModal(true);
  };

  const handleSellerDashboardClick = () => {
    setIsMenuOpen(false);
    setShowSellerDashboard(true);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <div className="profile-avatar-container" ref={menuRef}>
      {/* User Name and Avatar */}
      <div className="profile-navbar-section">
        <span className="profile-navbar-name">
          Hi, {user.firstName || user.username || 'User'}
        </span>
        <button
          className="profile-avatar"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Profile menu"
        >
          <span className="profile-initials">{getInitials()}</span>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <div className="profile-info">
              <div className="profile-name">{getDisplayName()}</div>
              <div className="profile-role">{user.role}</div>
            </div>
          </div>
          <div className="profile-menu-divider"></div>
          <button
            className="profile-menu-item"
            onClick={handleProfileClick}
          >
            <span className="menu-icon">👤</span>
            Profile
          </button>
          {user.role === 'seller' && (
            <button
              className="profile-menu-item"
              onClick={handleSellerDashboardClick}
            >
              <span className="menu-icon">🏪</span>
              My Store
            </button>
          )}
          <button
            className="profile-menu-item logout"
            onClick={handleLogoutClick}
          >
            <span className="menu-icon">🚪</span>
            Logout
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Seller Dashboard */}
      {showSellerDashboard && (
        <SellerDashboard
          onClose={() => setShowSellerDashboard(false)}
        />
      )}
    </div>
  );
};

// Profile Modal Component
const ProfileModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    username: user.username || '',
    phone: user.phone || '',
    address: user.address || '',
    brandName: user.brandName || '', // For sellers
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the profile update API
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          window.location.reload(); // Refresh to update the profile data
        }, 1500);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled // Email usually shouldn't be editable
            />
          </div>

          {user.role === 'seller' && (
            <div className="form-group">
              <label htmlFor="brandName">Brand Name</label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileAvatar;

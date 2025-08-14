import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SignupModal.css';

const AuthModal = ({ onClose }) => {
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [accountType, setAccountType] = useState('user'); // 'user' or 'seller'
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    brandName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      
      if (mode === 'signup') {
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          ...(accountType === 'seller' && { brandName: formData.brandName })
        };
        result = await signup(userData, accountType);
      } else {
        const credentials = {
          email: formData.email,
          password: formData.password
        };
        result = await login(credentials, accountType);
      }

      // Success - close modal (AuthContext will handle state updates)
      console.log(`${mode} successful:`, result);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setError('');
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      brandName: ''
    });
  };

  const switchAccountType = (type) => {
    setAccountType(type);
    setError('');
  };

  return (
    <div className="qc-modal-backdrop" onClick={onClose}>
      <div className="qc-modal" onClick={e => e.stopPropagation()}>
        <button className="qc-modal-close" onClick={onClose}>&times;</button>
        
        <h2>{mode === 'signup' ? 'Join' : 'Welcome back to'} QuickCart</h2>
        
        {/* Mode Toggle */}
        <div className="qc-mode-toggle">
          <button 
            className={`qc-toggle-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
          <button 
            className={`qc-toggle-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Log In
          </button>
        </div>

        {/* Account Type Selection */}
        <div className="qc-account-type">
          <label className="qc-radio-label">
            <input
              type="radio"
              name="accountType"
              value="user"
              checked={accountType === 'user'}
              onChange={() => switchAccountType('user')}
            />
            <span className="qc-radio-custom"></span>
            Customer Account
          </label>
          <label className="qc-radio-label">
            <input
              type="radio"
              name="accountType"
              value="seller"
              checked={accountType === 'seller'}
              onChange={() => switchAccountType('seller')}
            />
            <span className="qc-radio-custom"></span>
            Seller Account
          </label>
        </div>

        {error && <div className="qc-error-message">{error}</div>}

        <form className="qc-auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="qc-name-row">
                <label>
                  First Name
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </label>
                <label>
                  Last Name
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </label>
              </div>
              
              <label>
                Username
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="johndoe"
                  required
                />
              </label>

              {accountType === 'seller' && (
                <label>
                  Brand Name
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="Your Brand Name"
                    required
                  />
                </label>
              )}
            </>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
          </label>

          <button 
            type="submit" 
            className="qc-modal-submit" 
            disabled={loading}
          >
            {loading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Log In')}
          </button>
        </form>

        <div className="qc-modal-footer">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" className="qc-link-btn" onClick={switchMode}>
            {mode === 'signup' ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

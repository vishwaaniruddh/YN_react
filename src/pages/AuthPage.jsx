import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';
import './AuthPage.css';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/account';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const url = `${API_BASE_URL}/auth.php?action=${activeTab}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (activeTab === 'login') {
          login(data.user, data.token);
          navigate(from, { replace: true });
        } else {
          // Signup successful, usually we auto-login or switch to login
          // Let's just login if we get user + token, else switch to login
          if (data.token) {
            login(data.user, data.token);
            navigate(from, { replace: true });
          } else {
            setActiveTab('login');
            setError(''); // clear any errors
            alert('Signup successful! Please login.');
          }
        }
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <div className="auth-sidebar">
          <h2>Welcome to YosshitaNeha</h2>
          <p>Sign in to access your luxury bridal dashboard, manage your orders, and save your favorite exquisite pieces.</p>
          
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setError(''); }}
            >
              Login
            </button>
            <button 
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => { setActiveTab('signup'); setError(''); }}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="auth-form-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="auth-error">{error}</div>}

                {activeTab === 'signup' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                {activeTab === 'signup' && (
                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                )}

                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <button type="submit" className="btn-primary btn-full" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : (activeTab === 'login' ? 'Sign In' : 'Create Account')}
                </button>

                <div className="auth-divider">or continue with</div>

                <button type="button" className="btn-google" onClick={() => alert('Google OAuth integration coming soon!')}>
                  <GoogleIcon />
                  Google
                </button>
                
              </form>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

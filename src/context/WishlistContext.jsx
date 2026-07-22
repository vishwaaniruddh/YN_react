import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config/api';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    // Get or create session token (should match CartContext)
    let token = localStorage.getItem('yn_session_token');
    if (!token) {
      token = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('yn_session_token', token);
    }
    setSessionToken(token);
    fetchWishlist(token);
  }, []);

  const fetchWishlist = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist.php`, {
        headers: { 'X-Session-Token': token }
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      if (data.success) {
        fetchWishlist(sessionToken); // refresh
        return data.action; // 'added' or 'removed'
      }
      return null;
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      return null;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

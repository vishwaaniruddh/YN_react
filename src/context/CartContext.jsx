import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    // Get or create session token
    let token = localStorage.getItem('yn_session_token');
    if (!token) {
      token = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('yn_session_token', token);
    }
    setSessionToken(token);
    fetchCart(token);
  }, []);

  const fetchCart = async (token = sessionToken) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cart.php`, {
        headers: { 'X-Session-Token': token }
      });
      const data = await res.json();
      if (data.success) {
        setCartItems(data.data.items || []);
        setCartTotal(data.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart(sessionToken); // refresh cart
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error("Failed to add to cart:", error);
      return { success: false, message: "Network error while adding to cart" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!productId) return { success: false, message: "Invalid product ID" };
    try {
      const res = await fetch(`${API_BASE_URL}/cart.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      const data = await res.json();
      if (data.success) {
        await fetchCart(sessionToken);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
      return { success: false, message: "Network error while updating cart" };
    }
  };

  const removeFromCart = async (productId) => {
    if (!productId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/cart.php?product_id=${productId}`, {
        method: 'DELETE',
        headers: { 'X-Session-Token': sessionToken }
      });
      const data = await res.json();
      await fetchCart(sessionToken);
      return data;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  };

  const clearCart = async () => {
    try {
      if (sessionToken) {
        await fetch(`${API_BASE_URL}/cart.php`, {
          method: 'DELETE',
          headers: { 'X-Session-Token': sessionToken }
        });
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setCartItems([]);
      setCartTotal(0);
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

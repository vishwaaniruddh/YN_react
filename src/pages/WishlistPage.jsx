import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Heart, ArrowRight, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../config/api';
import './WishlistPage.css';

function formatPrice(price) {
  return '₹' + parseInt(price).toLocaleString('en-IN');
}

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (product) => {
    const success = await addToCart(product.id, 1);
    if (success) {
      await toggleWishlist(product.id); // Remove from wishlist after adding to cart
    }
  };

  return (
    <div className="wishlist-page">
      <div className="container">
        <h1 className="wishlist-page__title">My Wishlist</h1>
        
        {wishlistItems.length === 0 ? (
          <div className="wishlist-page__empty">
            <p>You haven't saved any items yet.</p>
            <Link to="/collections" className="button">Explore Collections</Link>
          </div>
        ) : (
          <div className="wishlist-page__grid">
            <AnimatePresence>
              {wishlistItems.map(item => {
                const price = parseFloat(item.sale_price > 0 ? item.sale_price : item.price);
                return (
                  <motion.div 
                    key={item.wishlist_item_id}
                    className="wishlist-item"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link to={`/product/${item.slug}`} className="wishlist-item__image-link">
                      <img 
                        src={getImageUrl(item.main_image)} 
                        alt={item.name} 
                        className="wishlist-item__image" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=No+Image'; }}
                      />
                    </Link>
                    
                    <button 
                      className="wishlist-item__remove" 
                      onClick={() => toggleWishlist(item.id)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="wishlist-item__details">
                      <Link to={`/product/${item.slug}`} className="wishlist-item__name">
                        {item.name}
                      </Link>
                      <div className="wishlist-item__price">{formatPrice(price)}</div>
                      
                      <button 
                        className="button wishlist-item__add-cart"
                        onClick={() => handleMoveToCart(item)}
                      >
                        <ShoppingBag size={14} />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

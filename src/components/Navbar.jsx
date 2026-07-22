// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Gem, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from './SearchOverlay';
import './Navbar.css';

import { API_BASE_URL } from '../config/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();

  // Calculate total quantity in cart
  const cartCount = cartItems.reduce((total, item) => total + parseInt(item.quantity), 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories.php?tree=true`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          // Filter to only show top level categories that have a parent_id of null
          const topLevel = data.data.filter(cat => !cat.parent_id);
          setCategories(topLevel);
        }
      })
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
            <img src="/logo_new-removebg.png" alt="YosshitaNeha" style={{ height: '58px', width: 'auto', maxWidth: '240px', objectFit: 'contain' }} />
          </Link>

          {/* Desktop Nav */}
          <ul className="navbar__links">
            <li><Link to="/collections">Shop</Link></li>
            {categories.map(cat => (
              <li 
                key={cat.id} 
                className="navbar__item-has-dropdown"
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link to={`/category/${cat.path}`} onClick={() => setHoveredCategory(null)}>{cat.name}</Link>
                {cat.children && cat.children.length > 0 && (
                  <div className={`mega-menu ${hoveredCategory === cat.id ? 'mega-menu--active' : ''}`}>
                    <div className="mega-menu__header">{cat.name}</div>
                    <div className="mega-menu__inner">
                      {cat.children.map(sub => {
                        const hasSubChildren = sub.children && sub.children.length > 0;
                        return (
                          <div key={sub.id} className="mega-menu__section">
                            <h4 className={hasSubChildren ? 'parent-title' : 'simple-title'}>
                              <Link to={`/category/${sub.path}`} onClick={() => setHoveredCategory(null)}>{sub.name}</Link>
                            </h4>
                            {hasSubChildren && (
                              <ul>
                                {sub.children.map(subsub => (
                                  <li key={subsub.id}>
                                    <Link to={`/category/${subsub.path}`} onClick={() => setHoveredCategory(null)}>{subsub.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          {/* Action Icons */}
          <div className="navbar__actions">
            <button aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link to={user ? "/account" : "/auth"} aria-label="Account">
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link to="/wishlist" className="navbar__cart" aria-label="Wishlist">
              <Heart size={18} strokeWidth={1.5} />
              {wishlistCount > 0 && <span className="navbar__cart-count">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="navbar__cart" aria-label="Cart">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && <span className="navbar__cart-count">{cartCount}</span>}
            </Link>
            <button
              className="navbar__hamburger"
              aria-label="Menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'mobile-drawer--open' : ''}`}>
        <ul className="mobile-drawer__links">
          <li><Link to="/collections" onClick={() => setMobileOpen(false)}>Shop</Link></li>
          {categories.map(cat => (
            <li key={`mobile-${cat.id}`}>
              <Link to={`/category/${cat.path}`} onClick={() => setMobileOpen(false)}>{cat.name}</Link>
            </li>
          ))}
          <li><Link to="/about" onClick={() => setMobileOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link></li>
          <li><Link to={user ? "/account" : "/auth"} onClick={() => setMobileOpen(false)}>Account</Link></li>
        </ul>
      </div>
      {mobileOpen && <div className="mobile-drawer__backdrop" onClick={() => setMobileOpen(false)} />}

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

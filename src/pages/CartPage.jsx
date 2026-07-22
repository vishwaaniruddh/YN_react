import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './CartPage.css';

function formatPrice(price) {
  return '₹' + parseInt(price || 0).toLocaleString('en-IN');
}

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Dynamic Shipping Charge state
  const [shippingCharge, setShippingCharge] = useState(0);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);

  // Restore saved coupon if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('yn_applied_coupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Fetch Dynamic Shipping Charge whenever cartTotal changes
  useEffect(() => {
    if (cartTotal > 0) {
      setIsShippingLoading(true);
      fetch(`${API_BASE_URL}/shipping.php?subtotal=${cartTotal}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShippingCharge(parseFloat(data.shipping_charge));
          }
        })
        .catch(err => console.error("Error fetching shipping:", err))
        .finally(() => setIsShippingLoading(false));
    } else {
      setShippingCharge(0);
    }
  }, [cartTotal]);

  // Re-validate coupon if cart total changes
  useEffect(() => {
    if (appliedCoupon && cartTotal > 0) {
      fetch(`${API_BASE_URL}/coupon.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', code: appliedCoupon.code, subtotal: cartTotal })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.valid) {
            setAppliedCoupon(data);
            sessionStorage.setItem('yn_applied_coupon', JSON.stringify(data));
          } else {
            setAppliedCoupon(null);
            sessionStorage.removeItem('yn_applied_coupon');
            setCouponError(data.message || 'Coupon is no longer valid for this cart total.');
          }
        })
        .catch(err => console.error("Error revalidating coupon:", err));
    }
  }, [cartTotal]);

  // Apply Coupon Handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError('');
    setCouponSuccess('');
    setIsCouponApplying(true);

    fetch(`${API_BASE_URL}/coupon.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', code: couponInput.trim(), subtotal: cartTotal })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.valid) {
          setAppliedCoupon(data);
          sessionStorage.setItem('yn_applied_coupon', JSON.stringify(data));
          setCouponSuccess(data.message || `Coupon ${data.code} applied successfully!`);
          setCouponInput('');
        } else {
          setCouponError(data.message || 'Invalid coupon code.');
        }
      })
      .catch(err => {
        setCouponError('Failed to validate coupon code.');
      })
      .finally(() => setIsCouponApplying(false));
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('yn_applied_coupon');
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const afterDiscountSubtotal = Math.max(0, cartTotal - discountAmount);
  const grandTotal = Math.max(0, afterDiscountSubtotal + shippingCharge);

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">Your Shopping Bag</h1>
        
        {cartItems.length === 0 ? (
          <div className="cart-page__empty">
            <p>Your cart is currently empty.</p>
            <Link to="/collections" className="button">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            
            <div className="cart-page__items">
              <AnimatePresence>
                {cartItems.map(item => {
                  const effectivePrice = parseFloat(item.sale_price > 0 ? item.sale_price : item.price);
                  const hasDiscount = item.has_discount || (item.original_price && item.original_price > effectivePrice);
                  const originalPrice = parseFloat(item.original_price || item.price);

                  return (
                    <motion.div 
                      key={item.cart_item_id}
                      className="cart-item"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    >
                      <Link to={`/product/${item.slug}`} className="cart-item__image-link">
                        <img 
                          src={getImageUrl(item.main_image)} 
                          alt={item.name} 
                          className="cart-item__image" 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/120x150?text=No+Image'; }}
                        />
                      </Link>
                      <div className="cart-item__details">
                        <div className="cart-item__header">
                          <Link to={`/product/${item.slug}`} className="cart-item__name">
                            {item.name}
                          </Link>
                          <div style={{ textAlign: 'right' }}>
                            {hasDiscount && (
                              <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px', marginRight: '6px' }}>
                                {formatPrice(originalPrice * item.quantity)}
                              </span>
                            )}
                            <span className="cart-item__price" style={{ color: hasDiscount ? '#c8a55c' : 'var(--ivory)', fontWeight: 600 }}>
                              {formatPrice(effectivePrice * item.quantity)}
                            </span>
                            {item.discount_info && (
                              <div style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600, marginTop: '2px' }}>
                                <Tag size={10} style={{ display: 'inline', marginRight: '3px' }} />
                                {item.discount_info.label}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="cart-item__sku">SKU: {item.sku}</span>
                        
                        <div className="cart-item__actions">
                          <div className="cart-item__quantity">
                            <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button 
                            className="cart-item__remove" 
                            onClick={() => removeFromCart(item.product_id)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="cart-page__summary">
              <h2>Order Summary</h2>
              
              <div className="cart-page__summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              {/* Coupon Row */}
              {appliedCoupon && (
                <div className="cart-page__summary-row" style={{ color: '#4ecdc4' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} /> Coupon ({appliedCoupon.code})
                    <button 
                      onClick={handleRemoveCoupon}
                      title="Remove Coupon"
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0 4px' }}
                    >
                      <X size={14} />
                    </button>
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {/* Dynamic Shipping Charge */}
              <div className="cart-page__summary-row">
                <span>Shipping Fee</span>
                <span>
                  {isShippingLoading ? (
                    <span style={{ fontSize: '12px', color: '#888' }}>Calculating...</span>
                  ) : shippingCharge === 0 ? (
                    <strong style={{ color: '#4ecdc4', letterSpacing: '0.5px' }}>FREE</strong>
                  ) : (
                    formatPrice(shippingCharge)
                  )}
                </span>
              </div>

              {/* Coupon Form Input */}
              <div className="cart-page__coupon-section" style={{ margin: '20px 0', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="PROMO / COUPON CODE" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '4px',
                        color: '#fff',
                        padding: '10px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={isCouponApplying || !couponInput.trim()}
                      className="button"
                      style={{
                        padding: '10px 16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: 'var(--gold)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {isCouponApplying ? '...' : 'APPLY'}
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(78, 205, 196, 0.08)', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ecdc4', fontSize: '13px', fontWeight: '600' }}>
                      <CheckCircle2 size={16} /> Code <strong>{appliedCoupon.code}</strong> Applied!
                    </div>
                    <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b', fontSize: '12px', marginTop: '8px' }}>
                    <AlertCircle size={14} /> {couponError}
                  </div>
                )}
                {couponSuccess && !appliedCoupon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ecdc4', fontSize: '12px', marginTop: '8px' }}>
                    <CheckCircle2 size={14} /> {couponSuccess}
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="cart-page__summary-row cart-page__summary-total">
                <span>Total</span>
                <span style={{ color: 'var(--gold)', fontSize: '20px', fontWeight: '700' }}>{formatPrice(grandTotal)}</span>
              </div>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
              
              <div className="cart-page__secure-checkout">
                <p>Secure Checkout Process</p>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

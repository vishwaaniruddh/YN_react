import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, Tag, CheckCircle2, AlertCircle, X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './CartPage.css';

function formatPrice(price) {
  return '₹' + parseInt(price || 0).toLocaleString('en-IN');
}

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Stock error notification state
  const [stockError, setStockError] = useState('');
  
  // Item removal confirmation state
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removeToast, setRemoveToast] = useState('');

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

  // Quantity Change Handler
  const handleQuantityChange = async (productId, newQuantity, availableStock) => {
    setStockError('');
    if (newQuantity > availableStock) {
      setStockError(`Only ${availableStock} units available in stock for this item.`);
      setTimeout(() => setStockError(''), 4000);
      return;
    }
    const result = await updateQuantity(productId, newQuantity);
    if (result && !result.success) {
      setStockError(result.message || 'Could not update quantity');
      setTimeout(() => setStockError(''), 4000);
    }
  };

  // Open Removal Confirmation Modal
  const promptRemoveItem = (item) => {
    setStockError('');
    setItemToRemove(item);
  };

  // Confirm Removal Handler
  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    const pId = itemToRemove.product_id || itemToRemove.id;
    const removedName = itemToRemove.name;
    setItemToRemove(null);
    await removeFromCart(pId);
    
    // Show toast confirmation
    setRemoveToast(`"${removedName}" removed from your bag.`);
    setTimeout(() => setRemoveToast(''), 4000);
  };

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
        
        {/* Removal Success Toast */}
        <AnimatePresence>
          {removeToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: '#10b98122',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <CheckCircle2 size={18} />
              <span>{removeToast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock Error Toast */}
        {stockError && (
          <div style={{
            background: '#ff6b6b22',
            border: '1px solid #ff6b6b',
            color: '#ff6b6b',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            <AlertCircle size={18} />
            <span>{stockError}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <motion.div 
            className="cart-page__empty"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '18px'
            }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200, 165, 92, 0.18) 0%, rgba(200, 165, 92, 0.02) 75%)',
              border: '1px solid rgba(200, 165, 92, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              boxShadow: '0 12px 35px rgba(200, 165, 92, 0.12)',
              position: 'relative'
            }}>
              <ShoppingBag size={46} strokeWidth={1.3} style={{ color: 'var(--gold, #c8a55c)' }} />
              <span style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#c8a55c',
                boxShadow: '0 0 10px #c8a55c'
              }}></span>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: '400',
              color: 'var(--ivory, #fff)',
              margin: '0',
              letterSpacing: '1px'
            }}>
              Your Shopping Bag is Empty
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#a1a1aa',
              maxWidth: '440px',
              lineHeight: '1.6',
              margin: '0 0 12px 0'
            }}>
              Explore our handcrafted designer blouses, regal bridal couture, and heritage jewellery to curate your luxury wardrobe.
            </p>

            <Link 
              to="/collections" 
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 32px',
                fontSize: '13px',
                fontWeight: '600',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #c8a55c 0%, #a68b4b 100%)',
                color: '#000',
                borderRadius: '6px',
                boxShadow: '0 4px 15px rgba(200, 165, 92, 0.3)'
              }}
            >
              <span>Explore Collections</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="cart-page__layout">
            
            <div className="cart-page__items">
              <AnimatePresence>
                {cartItems.map(item => {
                  const productId = item.product_id || item.id;
                  const availableStock = (item.stock_qty !== null && item.stock_qty !== undefined) ? parseInt(item.stock_qty) : 99;
                  const isMaxStock = item.quantity >= availableStock;

                  const effectivePrice = parseFloat(item.sale_price > 0 ? item.sale_price : item.price);
                  const hasDiscount = item.has_discount || (item.original_price && item.original_price > effectivePrice);
                  const originalPrice = parseFloat(item.original_price || item.price);

                  return (
                    <motion.div 
                      key={item.cart_item_id || productId}
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
                          <div>
                            <div className="cart-item__quantity">
                              <button 
                                onClick={() => handleQuantityChange(productId, item.quantity - 1, availableStock)} 
                                disabled={item.quantity <= 1}
                                title="Decrease Quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span>{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(productId, item.quantity + 1, availableStock)} 
                                disabled={isMaxStock}
                                title={isMaxStock ? `Max stock available: ${availableStock}` : "Increase Quantity"}
                                style={{ opacity: isMaxStock ? 0.4 : 1, cursor: isMaxStock ? 'not-allowed' : 'pointer' }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            {isMaxStock && (
                              <span style={{ fontSize: '11px', color: '#c8a55c', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                                Max stock ({availableStock} available)
                              </span>
                            )}
                          </div>

                          <button 
                            className="cart-item__remove" 
                            onClick={() => promptRemoveItem(item)}
                            aria-label="Remove item"
                            title="Remove from Cart"
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

      {/* Remove Item Confirmation Toast / Modal Overlay */}
      <AnimatePresence>
        {itemToRemove && (
          <motion.div 
            className="remove-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setItemToRemove(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div 
              className="remove-modal-content"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#121212',
                border: '1px solid rgba(200, 165, 92, 0.35)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '420px',
                padding: '32px 28px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(200, 165, 92, 0.15)',
                color: '#f5f0e8'
              }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 77, 77, 0.12)',
                border: '1px solid rgba(255, 77, 77, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
                color: '#ff4d4d'
              }}>
                <Trash2 size={26} />
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '500', margin: '0 0 10px 0', color: '#fff' }}>
                Remove Item from Bag?
              </h3>
              
              <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                Are you sure you want to remove <strong style={{ color: '#fff', fontWeight: '600' }}>"{itemToRemove.name}"</strong> from your shopping bag?
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setItemToRemove(null)}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Keep Item
                </button>

                <button
                  onClick={confirmRemoveItem}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff4d4d',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 15px rgba(255,77,77,0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, Plus, Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './CheckoutPage.css';

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { user, token, loading } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [shipping, setShipping] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Protect route
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: { pathname: '/checkout' } }, replace: true });
    }
  }, [user, loading, navigate]);

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing) {
      navigate('/collections', { replace: true });
    }
  }, [cartItems, navigate, isProcessing]);

  // Fetch States & Saved Addresses
  useEffect(() => {
    fetch(`${API_BASE_URL}/locations.php?action=states`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setStatesList(data.states);
      })
      .catch(err => console.error(err));

    if (token) {
      fetch(`${API_BASE_URL}/account.php?action=addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const primary = data.addresses.find(a => a.is_default) || data.addresses[0];
            setSelectedAddressId(primary.id);
            fillAddressData(primary);
          }
        })
        .catch(err => console.error(err));
    }
  }, [token]);

  const fillAddressData = (addr) => {
    setShipping({
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || ''
    });
    if (addr.state) {
      fetchCitiesForState(addr.state);
    }
  };

  const fetchCitiesForState = (stateName) => {
    fetch(`${API_BASE_URL}/locations.php?action=cities&state_name=${encodeURIComponent(stateName)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCitiesList(data.cities);
      })
      .catch(err => console.error(err));
  };

  const handleSavedAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setShipping({ address_line_1: '', address_line_2: '', city: '', state: '', pincode: '' });
      setCitiesList([]);
    } else {
      const addr = savedAddresses.find(a => a.id == addrId);
      if (addr) fillAddressData(addr);
    }
  };

  const handleChange = (e) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStateSelect = (e) => {
    const selectedState = e.target.value;
    setShipping(prev => ({ ...prev, state: selectedState, city: '' }));
    if (selectedState) {
      fetchCitiesForState(selectedState);
    } else {
      setCitiesList([]);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isCouponApplying, setIsCouponApplying] = useState(false);

  // Restore coupon & fetch shipping on Checkout
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('yn_applied_coupon');
      if (saved) {
        setAppliedCoupon(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (cartTotal > 0) {
      fetch(`${API_BASE_URL}/shipping.php?subtotal=${cartTotal}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShippingCharge(parseFloat(data.shipping_charge));
          }
        })
        .catch(err => console.error(err));
    }
  }, [cartTotal]);

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    sessionStorage.removeItem('yn_applied_coupon');
    setCouponSuccess('');
    setCouponError('');
  };

  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
  const afterDiscountSubtotal = Math.max(0, cartTotal - discountAmount);
  const grandTotal = Math.max(0, afterDiscountSubtotal + shippingCharge);

  // 1. Create order on backend
  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/checkout.php?action=create_order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ 
          items: cartItems, 
          shipping, 
          coupon_code: appliedCoupon ? appliedCoupon.code : '' 
        })
      });
      
      const orderData = await res.json();
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      if (orderData.is_dummy) {
        await verifyPaymentOnBackend({
          razorpay_payment_id: 'dummy_pay_id',
          razorpay_order_id: orderData.razorpay_order_id,
          razorpay_signature: 'dummy_sig',
          order_id: orderData.order_id,
          is_dummy: true
        });
        return;
      }

      // 2. Load Razorpay
      const resLoad = await loadRazorpayScript();
      if (!resLoad) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 3. Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: roundNumber(orderData.amount * 100), // paise
        currency: 'INR',
        name: 'YosshitaNeha',
        description: 'Luxury Bridal Fashion',
        order_id: orderData.razorpay_order_id,
        handler: async function (response) {
          await verifyPaymentOnBackend({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            order_id: orderData.order_id
          });
        },
        prefill: {
          name: `${user?.first_name} ${user?.last_name}`,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: '#c8a55c' // YN Gold
        }
      };

      const paymentObject = new window.Razorpay(options);
      
      paymentObject.on('payment.failed', function (response) {
        setIsProcessing(false);
        setError('Payment Failed: ' + response.error.description);
      });
      
      paymentObject.open();

    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setIsProcessing(false);
    }
  };

  function roundNumber(num) {
    return Math.round(num);
  }

  const verifyPaymentOnBackend = async (paymentData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/checkout.php?action=verify_payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(paymentData)
      });
      
      const data = await res.json();
      if (data.success) {
        if (typeof clearCart === 'function') {
          clearCart();
        }
        navigate(`/order/${paymentData.order_id}`, { replace: true });
      } else {
        setError(data.message || 'Payment verification failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Verification error.');
      setIsProcessing(false);
    }
  };

  if (loading || !user) return <div className="checkout-page" style={{display:'flex', justifyContent:'center', alignItems:'center'}}><div className="spinner"></div></div>;

  return (
    <div className="checkout-page container">
      <h1>Secure Checkout</h1>
      
      <div className="checkout-container">
        
        <div className="checkout-left">
          <h2>Shipping Details</h2>
          {error && <div className="checkout-error">{error}</div>}

          {/* Saved Addresses Picker */}
          {savedAddresses.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--gold)', fontWeight: 600, marginBottom: '10px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} /> Select Saved Delivery Address
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {savedAddresses.map(addr => (
                  <div 
                    key={addr.id}
                    onClick={() => handleSavedAddressSelect(addr.id)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: selectedAddressId == addr.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                      background: selectedAddressId == addr.id ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)',
                      minWidth: '200px',
                      flex: 1
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ivory)' }}>
                      {addr.address_line_1}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted-text)', marginTop: '4px' }}>
                      {addr.city}, {addr.state} {addr.pincode}
                    </div>
                  </div>
                ))}

                <div 
                  onClick={() => handleSavedAddressSelect('new')}
                  style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: selectedAddressId === 'new' ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedAddressId === 'new' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--ivory)',
                    fontSize: '13px'
                  }}
                >
                  <Plus size={16} color="var(--gold)" /> Enter Different Address
                </div>
              </div>
            </div>
          )}
          
          <form id="checkout-form" onSubmit={handlePayment} className="checkout-form">
            <div className="form-group">
              <label>Address Line 1</label>
              <input 
                type="text" 
                name="address_line_1" 
                value={shipping.address_line_1} 
                onChange={handleChange} 
                placeholder="House / Flat No., Street Name"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Address Line 2 (Optional)</label>
              <input 
                type="text" 
                name="address_line_2" 
                value={shipping.address_line_2} 
                onChange={handleChange} 
                placeholder="Apartment, Landmark, Suite"
              />
            </div>
            
            <div className="form-row">
              {/* State Dropdown */}
              <div className="form-group">
                <label>State</label>
                <select 
                  name="state" 
                  value={shipping.state} 
                  onChange={handleStateSelect}
                  required
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '6px', width: '100%' }}
                >
                  <option value="">Select State</option>
                  {statesList.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div className="form-group">
                <label>City</label>
                <select 
                  name="city" 
                  value={shipping.city} 
                  onChange={handleChange}
                  required
                  disabled={!shipping.state}
                  style={{ 
                    background: '#111', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    padding: '12px', 
                    borderRadius: '6px', 
                    width: '100%',
                    opacity: shipping.state ? 1 : 0.5,
                    cursor: shipping.state ? 'pointer' : 'not-allowed'
                  }}
                >
                  <option value="">{shipping.state ? (citiesList.length > 0 ? 'Select City' : 'Loading cities...') : 'Select State First'}</option>
                  {citiesList.map(ct => (
                    <option key={ct.id} value={ct.name}>{ct.name}</option>
                  ))}
                </select>
              </div>

              {/* PIN Code */}
              <div className="form-group">
                <label>PIN Code</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={shipping.pincode} 
                  onChange={handleChange} 
                  placeholder="e.g. 400001"
                  required 
                />
              </div>
            </div>
          </form>
        </div>

        <div className="checkout-right">
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            
            <div className="checkout-items">
              {cartItems.map(item => {
                const price = item.sale_price > 0 ? parseFloat(item.sale_price) : parseFloat(item.price);
                const imgSrc = item.main_image ? getImageUrl(item.main_image) : 'https://placehold.co/100x120/1A1A1A/D4AF37?text=No+Image';
                return (
                  <div key={item.cart_id} className="checkout-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={imgSrc} alt={item.name} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--ivory)', fontWeight: 500, marginBottom: '5px' }}>{item.name}</div>
                      <div style={{ color: 'var(--muted-text)', fontSize: '12px' }}>
                        Qty: {item.quantity} | SKU: {item.sku}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--gold)', fontWeight: 600 }}>
                        {formatPrice(price * item.quantity)}
                      </div>
                      {item.sale_price > 0 && (
                        <div style={{ color: 'var(--muted-text)', fontSize: '12px', textDecoration: 'line-through', marginTop: '3px' }}>
                          {formatPrice(parseFloat(item.price) * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Section */}
            <div className="checkout-coupon-section" style={{ margin: '16px 0', paddingTop: '14px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '8px' }}>
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
                    type="button" 
                    onClick={handleApplyCoupon}
                    disabled={isCouponApplying || !couponInput.trim()}
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
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(78, 205, 196, 0.08)', padding: '10px 14px', borderRadius: '4px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ecdc4', fontSize: '13px', fontWeight: '600' }}>
                    <Tag size={16} /> Code <strong>{appliedCoupon.code}</strong> Applied!
                  </div>
                  <button type="button" onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>
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

            <div className="checkout-totals">
              <div className="checkout-totals-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="checkout-totals-row" style={{ color: '#4ecdc4' }}>
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="checkout-totals-row">
                <span>Shipping Fee</span>
                <span>{shippingCharge === 0 ? <strong style={{ color: '#4ecdc4' }}>FREE</strong> : formatPrice(shippingCharge)}</span>
              </div>
              <div className="checkout-totals-row grand-total">
                <span>Total to Pay</span>
                <span style={{ color: 'var(--gold)', fontSize: '20px', fontWeight: '700' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button 
              type="submit" 
              form="checkout-form" 
              className="btn-primary pay-btn"
              disabled={isProcessing}
            >
              <ShieldCheck size={20} />
              {isProcessing ? 'Processing...' : `Pay ${formatPrice(grandTotal)}`}
            </button>
            <p style={{ textAlign: 'center', color: 'var(--muted-text)', fontSize: '12px', marginTop: '15px' }}>
              Your payment information is securely processed by Razorpay.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

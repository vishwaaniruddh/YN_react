import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, MapPin, Printer, ExternalLink, CreditCard, 
  Truck, Calendar, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatOrderNumber } from '../utils/order';
import { API_BASE_URL, ADMIN_BASE_URL, getImageUrl } from '../config/api';
import './CheckoutPage.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token, loading, user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id, token]);

  const fetchOrderDetail = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/account.php?action=order_detail&id=${id}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Order not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load order details.');
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
    return (
      <div className="checkout-page container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="checkout-page container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2 style={{ color: 'var(--gold)', marginBottom: '15px' }}>Order Not Found</h2>
        <p style={{ color: 'var(--muted-text)', marginBottom: '30px' }}>{error || 'Unable to locate order information.'}</p>
        <Link to="/account" className="btn-primary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} /> Return to My Account
        </Link>
      </div>
    );
  }

  const shippingAddr = order.shipping_address || {};
  const customerName = `${user?.first_name || order.customer?.first_name || ''} ${user?.last_name || order.customer?.last_name || ''}`.trim() || 'Customer';

  return (
    <div className="checkout-page" style={{ width: '95%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px', paddingTop: '120px' }}>
      
      {/* Back Button Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/account" state={{ tab: 'orders' }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back to My Orders
        </Link>
        <a 
          href={`${ADMIN_BASE_URL}/invoice-pdf.php?id=${id}&action=print&auto=1`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-outline" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
        >
          <Printer size={16} /> Print Receipt / PDF
        </a>
      </div>

      {/* Main Order Container */}
      <div style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Order Header Summary */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '24px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '28px', margin: 0, color: 'var(--ivory)' }}>Order {order.order_number || formatOrderNumber(order.id)}</h1>
              <span style={{ 
                fontSize: '12px', 
                fontWeight: 700, 
                padding: '4px 12px', 
                borderRadius: '20px',
                background: order.status === 'Delivered' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                color: order.status === 'Delivered' ? '#2ecc71' : 'var(--gold)',
                border: order.status === 'Delivered' ? '1px solid rgba(46, 204, 113, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)'
              }}>
                {order.status}
              </span>
            </div>
            <div style={{ color: 'var(--muted-text)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span><Calendar size={14} style={{ display: 'inline', marginRight: '5px' }} /> Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              <span><CreditCard size={14} style={{ display: 'inline', marginRight: '5px' }} /> {order.payment_method || 'Razorpay Online Payment'}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--muted-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount Paid</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--gold)', marginTop: '2px' }}>
              ₹{parseFloat(order.total_amount).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Fulfillment Status Progress Tracker */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: 700 }}>
            Order Fulfillment Overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212, 175, 55, 0.08)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <CheckCircle2 size={24} color="var(--gold)" />
              <div>
                <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '13px' }}>Order Placed</div>
                <div style={{ color: 'var(--muted-text)', fontSize: '11px' }}>Payment Confirmed</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212, 175, 55, 0.08)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <Truck size={24} color="var(--gold)" />
              <div>
                <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '13px' }}>Preparing &amp; Packing</div>
                <div style={{ color: 'var(--muted-text)', fontSize: '11px' }}>Quality Inspection</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '14px 18px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <ShieldCheck size={24} color="var(--muted-text)" />
              <div>
                <div style={{ color: 'var(--muted-text)', fontWeight: 500, fontSize: '13px' }}>Out for Delivery</div>
                <div style={{ color: 'var(--muted-text)', fontSize: '11px' }}>Express Courier</div>
              </div>
            </div>

          </div>
        </div>

        {/* Grid Section: Left Items List, Right Address & Billing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: '36px' }}>
          
          {/* Left: Items Breakdown */}
          <div>
            <h2 style={{ fontSize: '16px', color: 'var(--ivory)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--gold)" /> Items Purchased ({order.items ? order.items.length : 0})
            </h2>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
              {order.items && order.items.map((item, idx) => {
                const imgSrc = item.main_image ? getImageUrl(item.main_image) : 'https://placehold.co/80x100/1A1A1A/D4AF37?text=No+Image';
                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', padding: '14px 0', borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <Link to={`/product/${item.slug || ''}`}>
                      <img src={imgSrc} alt={item.name} style={{ width: '70px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </Link>
                    <div style={{ flex: 1 }}>
                      <Link to={`/product/${item.slug || ''}`} style={{ color: 'var(--ivory)', fontSize: '15px', fontWeight: 500, textDecoration: 'none', display: 'block', marginBottom: '6px' }}>
                        {item.name}
                      </Link>
                      <div style={{ color: 'var(--muted-text)', fontSize: '12px', marginBottom: '4px' }}>
                        SKU: <span style={{ color: '#ccc' }}>{item.sku}</span>
                      </div>
                      <div style={{ color: 'var(--muted-text)', fontSize: '12px' }}>
                        Quantity: <strong>{item.quantity}</strong> × ₹{parseFloat(item.price).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
                        <div style={{ color: 'var(--muted-text)', fontSize: '12px', textDecoration: 'line-through', marginBottom: '2px' }}>
                          ₹{parseFloat(item.original_price * item.quantity).toLocaleString()}
                        </div>
                      )}
                      <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '15px' }}>
                        ₹{parseFloat(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Address & Payment Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery Address Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Shipping &amp; Delivery Address
              </h3>
              <div style={{ fontSize: '14px', color: 'var(--ivory)', lineHeight: '1.6' }}>
                <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>{customerName}</strong>
                {shippingAddr.address_line_1 ? (
                  <>
                    <div>{shippingAddr.address_line_1}</div>
                    {shippingAddr.address_line_2 && <div>{shippingAddr.address_line_2}</div>}
                    <div>{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}</div>
                  </>
                ) : (
                  <div>Primary Address on file</div>
                )}
                <div style={{ color: 'var(--muted-text)', fontSize: '12px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  Contact: {user?.phone || 'On file'} | Email: {user?.email}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} /> Payment Overview
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted-text)', marginBottom: '8px' }}>
                <span>Payment Method</span>
                <span style={{ color: 'var(--ivory)', fontWeight: 500 }}>{order.payment_method || 'Razorpay (Verified)'}</span>
              </div>

              {order.mrp_total && parseFloat(order.mrp_total) > parseFloat(order.subtotal_amount && parseFloat(order.subtotal_amount) > 0 ? order.subtotal_amount : order.total_amount) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted-text)', marginBottom: '8px' }}>
                  <span>Original Items MRP</span>
                  <span style={{ color: 'var(--ivory)', textDecoration: 'line-through' }}>₹{parseFloat(order.mrp_total).toLocaleString()}</span>
                </div>
              )}

              {order.product_discount && parseFloat(order.product_discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#2ecc71', marginBottom: '8px' }}>
                  <span>Product Discount</span>
                  <span>-₹{parseFloat(order.product_discount).toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted-text)', marginBottom: '8px' }}>
                <span>Items Subtotal</span>
                <span style={{ color: 'var(--ivory)' }}>₹{parseFloat(order.subtotal_amount && parseFloat(order.subtotal_amount) > 0 ? order.subtotal_amount : order.total_amount).toLocaleString()}</span>
              </div>

              {parseFloat(order.discount_amount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4ecdc4', marginBottom: '8px' }}>
                  <span>Coupon Discount ({order.coupon_code || 'Promo'})</span>
                  <span>-₹{parseFloat(order.discount_amount).toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted-text)', marginBottom: '12px' }}>
                <span>Express Shipping</span>
                <span style={{ color: parseFloat(order.shipping_charge || 0) === 0 ? '#2ecc71' : 'var(--ivory)', fontWeight: 600 }}>
                  {parseFloat(order.shipping_charge || 0) === 0 ? 'FREE' : `₹${parseFloat(order.shipping_charge).toLocaleString()}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <span>Total Amount Paid</span>
                <span>₹{parseFloat(order.total_amount).toLocaleString()}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: '16px' }}>
          <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted-text)', textDecoration: 'none', fontSize: '13px' }}>
            <HelpCircle size={16} /> Need help with this order? Contact Support
          </Link>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/collections" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}>
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { formatOrderNumber } from '../utils/order';
import './CheckoutPage.css';

export default function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.order_id;
  const orderNumber = location.state?.order_number || formatOrderNumber(orderId);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (!orderId) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/order/${orderId}`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, navigate]);

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="checkout-page container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
      <CheckCircle size={80} color="var(--gold)" style={{ marginBottom: '20px' }} />
      <h1 style={{ marginBottom: '20px' }}>Order Confirmed!</h1>
      <p style={{ color: 'var(--muted-text)', fontSize: '18px', maxWidth: '600px', marginBottom: '25px' }}>
        Thank you for shopping with YosshitaNeha. Your luxury pieces are being carefully prepared. 
        <br/><br/>
        Your Order ID is: <strong style={{ color: 'var(--ivory)' }}>{orderNumber}</strong>
      </p>

      {/* 2-Second Redirection Banner */}
      <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '35px' }}>
        <span style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: 600 }}>
          Opening detailed purchase overview in {countdown}s...
        </span>
        <ArrowRight size={16} color="var(--gold)" />
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to={`/order/${orderId}`} className="btn-primary" style={{ display: 'inline-block' }}>
          View Order Overview Now
        </Link>
        <Link to="/collections" className="btn-outline" style={{ display: 'inline-block' }}>
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

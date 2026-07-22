// src/pages/ShippingPolicyPage.jsx
import { useEffect } from 'react';
import { Truck } from 'lucide-react';
import './ShippingPolicyPage.css';

export default function ShippingPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="shipping-policy-page">
      <div className="shipping-policy-page__header">
        <div className="container">
          <Truck size={48} className="shipping-policy-page__icon" />
          <h1>Shipping Policy</h1>
          <p>Important information about how we deliver your luxury pieces.</p>
        </div>
      </div>
      
      <div className="container">
        <div className="shipping-policy-page__content">
          <p className="shipping-policy-page__intro">
            We are committed to delivering your order accurately, in good condition, and always on time. Below are some more shipping related points:
          </p>

          <ul className="shipping-policy-page__list">
            <li>
              User has to be present at the agreed date and time at the specified address given while placing an order on our website. Free Shipping is available Pan – India. The shipping charges for outside India will be communicated to you at the time of order processing.
            </li>
            <li>
              Each order would be shipped only to a single destination address specified at the time of payment for that order. If you wish to ship products to different addresses, you shall need to place multiple orders.
            </li>
            <li>
              We make our best efforts to ensure that each item in your order is shipped out within 7-8 working days of the order date. However in some cases, it may take longer to ship the order if there is a heavy demand.
            </li>
            <li>
              We ship out orders on all week days (Tuesday to Saturday), excluding public holidays.
            </li>
            <li>
              To ensure that your order reaches you in the fastest time and in good condition, we will only make shipments through reputed courier agencies.
            </li>
            <li>
              While we strive to ship all items in your order together, this may not always be possible due to product characteristics, or availability.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

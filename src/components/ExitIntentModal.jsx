import React, { useState, useEffect } from 'react';
import './ExitIntentModal.css';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Exit Intent Trigger Detection (Mouse Leaving Viewport Top)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10) {
        const dismissed = sessionStorage.getItem('yn_exit_intent_dismissed');
        if (!dismissed) {
          setIsOpen(true);
        }
      }
    };

    // 2. Fallback Idle Timer (Show after 45s for mobile/engaged users if not dismissed)
    const idleTimer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('yn_exit_intent_dismissed');
      if (!dismissed) {
        setIsOpen(true);
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(idleTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem('yn_exit_intent_dismissed', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('LUXURY10');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="exit-modal-overlay" onClick={handleDismiss}>
      <div className="exit-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="exit-modal-close" onClick={handleDismiss}>&times;</button>
        <div className="exit-modal-header">
          <span className="exit-modal-badge">✨ Exclusive First Order Offer</span>
          <h2>Claim 10% Off Your Luxury Wardrobe</h2>
          <p>Handcrafted Designer Blouses &amp; Heritage Jewellery</p>
        </div>
        <div className="exit-modal-body">
          <div className="exit-coupon-box">
            <span className="coupon-code">LUXURY10</span>
            <button className="copy-btn" onClick={handleCopyCode}>
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <a href="/collections" className="claim-now-btn" onClick={handleDismiss}>
            Explore Collections &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

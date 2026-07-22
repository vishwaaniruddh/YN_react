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
    navigator.clipboard.writeText('WELCOME10');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="exit-intent-overlay" onClick={handleDismiss}>
      <div className="exit-intent-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-intent-close" onClick={handleDismiss}>&times;</button>
        <span className="exit-intent-badge">✨ Exclusive First Order Offer</span>
        <h2 className="exit-intent-title">Claim 10% Off Your Luxury Wardrobe</h2>
        <p className="exit-intent-subtitle">Handcrafted Designer Blouses &amp; Heritage Jewellery</p>
        <div className="exit-intent-code-box">
          <span className="exit-intent-code">WELCOME10</span>
          <button className="exit-intent-copy-btn" onClick={handleCopyCode}>
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
        <a href="/collections" className="exit-intent-cta-btn" onClick={handleDismiss} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Explore Collections &rarr;
        </a>
        <button className="exit-intent-decline" onClick={handleDismiss}>
          No thanks, I'll pay full price
        </button>
      </div>
    </div>
  );
}

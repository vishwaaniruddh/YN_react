import React, { useState, useEffect } from 'react';
import './ExitIntentModal.css';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Send Visitor Telemetry Tracking Beacon to Backend
    const trackVisitor = () => {
      try {
        const payload = {
          page_url: window.location.pathname + window.location.search,
          referrer: document.referrer || '',
          user_agent: navigator.userAgent
        };

        // Use fetch async beacon
        fetch('/yn/admin/api/track_visitor.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {
          // Fallback relative path check
          fetch('/admin/api/track_visitor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        });
      } catch (err) {}
    };

    trackVisitor();

    // 2. Exit Intent Trigger Detection (Mouse Leaving Viewport Top)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 10) {
        const dismissed = sessionStorage.getItem('yn_exit_intent_dismissed');
        if (!dismissed) {
          setIsOpen(true);
        }
      }
    };

    // 3. Fallback Idle Timer (Show after 45s for mobile/engaged users if not dismissed)
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

  const handleClose = () => {
    sessionStorage.setItem('yn_exit_intent_dismissed', 'true');
    setIsOpen(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('WELCOME10');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div class="exit-intent-overlay" onClick={handleClose}>
      <div class="exit-intent-modal" onClick={(e) => e.stopPropagation()}>
        <button class="exit-intent-close" onClick={handleClose} aria-label="Close modal">
          &times;
        </button>

        <div class="exit-intent-badge">
          <span>✨ Exclusive Offer</span>
        </div>

        <h2 class="exit-intent-title">Wait! Don't Leave Empty Handed</h2>
        
        <p class="exit-intent-subtitle">
          Enjoy <strong>10% OFF</strong> your first luxury designer collection order with code below.
        </p>

        <div class="exit-intent-code-box">
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#71717a', letterSpacing: '1px' }}>
              PROMO CODE
            </div>
            <div class="exit-intent-code">WELCOME10</div>
          </div>
          <button class="exit-intent-copy-btn" onClick={handleCopyCode}>
            {copied ? '✓ COPIED' : 'COPY CODE'}
          </button>
        </div>

        <button class="exit-intent-cta-btn" onClick={handleClose}>
          CLAIM 10% OFF &amp; CONTINUE SHOPPING
        </button>

        <button class="exit-intent-decline" onClick={handleClose}>
          No thanks, I'll pay full price
        </button>
      </div>
    </div>
  );
}

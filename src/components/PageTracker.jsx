// src/components/PageTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send visitor tracking beacon on every route change
    const payload = JSON.stringify({
      page_url: window.location.href,
      referrer: document.referrer || '',
      user_agent: navigator.userAgent
    });

    try {
      const endpoint = `${API_BASE_URL}/track_visitor.php`;
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
      } else {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}
  }, [location.pathname, location.search]);

  return null;
}

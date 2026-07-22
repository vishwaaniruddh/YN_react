// src/components/PageTracker.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    // Send visitor tracking payload on every route change
    const payload = {
      page_url: window.location.href,
      referrer: document.referrer || '',
      user_agent: navigator.userAgent
    };

    try {
      const endpoint = `${API_BASE_URL}/track_visitor.php`;
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  }, [location.pathname, location.search]);

  return null;
}

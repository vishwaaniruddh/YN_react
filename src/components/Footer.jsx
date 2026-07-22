// src/components/Footer.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, MapPin, Phone, Mail, ChevronUp, Heart } from 'lucide-react';
import { footerLinks } from '../data/mockData';
import { API_BASE_URL } from '../config/api';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/newsletter.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to the server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand Column */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src="/logo_new-removebg.png" alt="YosshitaNeha" style={{ height: '58px', width: 'auto', maxWidth: '240px', objectFit: 'contain' }} />
            </Link>
            <p className="footer__tagline">
              Bespoke designer blouses, heritage jewellery & customisation studio — where every piece tells a story of artistry and tradition.
            </p>
            <div className="footer__contact">
              <div className="footer__contact-item">
                <MapPin size={14} />
                <span>104, Shyamkamal Building B/1, Agarwal Market, Near Deenanath Mangeshkar Natya Mandir, Vile Parle East, Mumbai 400057</span>
              </div>
              <div className="footer__contact-item">
                <Phone size={14} />
                <span>9324243011 / 7506628663</span>
              </div>
              <div className="footer__contact-item">
                <Mail size={14} />
                <span>yosshita.neha@gmail.com</span>
              </div>
            </div>
            <div className="footer__socials">
              <a href="#" aria-label="Instagram"><Heart size={18} /></a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="footer__links-col">
            <h4 className="footer__col-title">Informations</h4>
            <ul>
              {footerLinks.informations.map(link => (
                <li key={link.label}><Link to={link.path}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer__links-col">
            <h4 className="footer__col-title">Account</h4>
            <ul>
              {footerLinks.account.map(link => (
                <li key={link.label}><Link to={link.path}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="footer__links-col">
            <h4 className="footer__col-title">About Us</h4>
            <ul>
              {footerLinks.about.map(link => (
                <li key={link.label}><Link to={link.path}>{link.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer__newsletter">
            <h4 className="footer__col-title">Stay Updated</h4>
            <p className="footer__newsletter-desc">
              Subscribe for exclusive previews, new arrivals, and bridal inspiration.
            </p>
            <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '...' : 'Subscribe'}
              </button>
            </form>
            {status.message && (
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: status.type === 'success' ? '#2ecc71' : '#e74c3c'
              }}>
                {status.message}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer__bottom">
          <p>&copy; 2026 YosshitaNeha Fashion Studio. All Rights Reserved.</p>
          <button className="footer__back-to-top" onClick={scrollToTop} aria-label="Back to top">
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}

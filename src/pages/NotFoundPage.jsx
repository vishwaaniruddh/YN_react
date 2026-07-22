import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container not-found-page__container">
        <h1 className="not-found-page__title">404</h1>
        <h2 className="not-found-page__subtitle">Page Not Found</h2>
        <p className="not-found-page__text">
          We're sorry, but the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        
        <div className="not-found-page__actions">
          <button onClick={() => window.history.back()} className="btn-outline">
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <Home size={18} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

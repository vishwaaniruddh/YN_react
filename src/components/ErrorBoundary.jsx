import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import '../pages/NotFoundPage.css'; // We can reuse the styling from NotFoundPage

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="not-found-page">
          <div className="container not-found-page__container">
            <div style={{ color: 'var(--accent-red)', marginBottom: '20px' }}>
              <AlertTriangle size={80} />
            </div>
            <h2 className="not-found-page__subtitle">Something went wrong</h2>
            <p className="not-found-page__text">
              We encountered an unexpected error while loading this page. 
              Our team has been notified. Please try refreshing the page.
            </p>
            
            <div className="not-found-page__actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                <RefreshCcw size={18} /> Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

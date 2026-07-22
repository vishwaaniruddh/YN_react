import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, ArrowUpRight } from 'lucide-react';
import './SearchOverlay.css';

const popularSearches = [
  'BRIDAL NECKLACE', 'KUNDAN', 'JHUMKA', 'POLKI', 
  'MAANG TIKKA', 'LEHENGA', 'BANGLES', 'RANI HAAR', 
  'CHOKER', 'EARRINGS'
];

const discoverLinks = [
  { label: 'Bridal Atelier', url: '/category/bridal-wears' },
  { label: 'Necklace Sets', url: '/category/jewellery/necklace-sets' },
  { label: 'Earrings', url: '/category/jewellery/earrings' },
  { label: 'View All Pieces', url: '/collections' }
];

export default function SearchOverlay({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Clear input on close
      setSearchQuery('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handlePopularSearch = (term) => {
    navigate(`/collections?search=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay__header">
        <span className="search-overlay__title">SEARCH THE ATELIER</span>
        <button className="search-overlay__close" onClick={onClose} aria-label="Close search">
          <X size={24} strokeWidth={1} />
        </button>
      </div>

      <div className="search-overlay__content container">
        <form className="search-overlay__form" onSubmit={handleSearchSubmit}>
          <Search className="search-overlay__icon" size={32} strokeWidth={1} />
          <input 
            type="text" 
            className="search-overlay__input"
            placeholder="Search for necklaces, kundan, bridal sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </form>

        <div className="search-overlay__layout">
          <div className="search-overlay__left">
            <div className="search-overlay__section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              <span>POPULAR SEARCHES</span>
            </div>
            <div className="search-overlay__tags">
              {popularSearches.map(term => (
                <button 
                  key={term} 
                  className="search-overlay__tag"
                  onClick={() => handlePopularSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="search-overlay__right">
            <div className="search-overlay__section-title">
              <span>DISCOVER</span>
            </div>
            <ul className="search-overlay__discover-links">
              {discoverLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.url} onClick={onClose}>
                    <span>{link.label}</span>
                    <ArrowUpRight size={18} strokeWidth={1} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

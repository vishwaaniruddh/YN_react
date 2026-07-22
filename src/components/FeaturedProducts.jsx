// src/components/FeaturedProducts.jsx — Revamped with Real API Data
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './FeaturedProducts.css';

const tabs = [
  { label: 'Trending', slug: null, sort: 'popular' },
  { label: 'Necklace Sets', slug: 'neclace-sets' },
  { label: 'Earrings', slug: 'earrings' },
  { label: 'Kundan', slug: 'kundan' },
];

function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const tab = tabs[activeTab];
    let url = `${API_BASE_URL}/products.php?limit=8`;
    if (tab.slug) {
      url += `&category_slug=${tab.slug}`;
    }
    if (tab.sort) {
      url += `&sort=${tab.sort}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.data || []);
        }
      })
      .catch(err => console.error('Failed to fetch products:', err))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section className="featured" id="featured">
      <div className="container">
        <div className="featured__header">
          <p className="section-label">Featured Collection</p>
          <h2 className="section-title">Handpicked for You</h2>
          <p className="section-subtitle">
            Our curators' selection of the most exquisite pieces — real artisan jewellery from our catalogue.
          </p>
        </div>

        <div className="featured__tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              className={`featured__tab ${activeTab === i ? 'featured__tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div className="featured__grid" layout>
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Skeleton loaders
              Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  className="product-card product-card--skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="product-card__image-wrapper skeleton-pulse" />
                  <div className="product-card__info">
                    <div className="skeleton-line skeleton-line--sm" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line--md" />
                  </div>
                </motion.div>
              ))
            ) : (
              products.map(product => (
                <motion.div
                  key={product.id}
                  className="product-card"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35 }}
                >
                  <Link to={`/product/${product.slug}`} className="product-card__link">
                    <div className="product-card__image-wrapper">
                      <img
                        src={getImageUrl(product.main_image)}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                      />
                      <div className="product-card__hover-actions">
                        <button className="product-card__action" aria-label="Quick View" onClick={e => e.preventDefault()}>
                          <Eye size={16} />
                        </button>
                        <button className="product-card__action" aria-label="Add to Wishlist" onClick={e => e.preventDefault()}>
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="product-card__info">
                      <span className="product-card__category">{product.category_name || 'Jewellery'}</span>
                      <h3 className="product-card__name">{product.name}</h3>
                      <div className="product-card__pricing">
                        <span className="product-card__price">{formatPrice(product.sale_price || product.price)}</span>
                        {product.sale_price && product.sale_price !== product.price && (
                          <span className="product-card__original">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        <div className="featured__footer">
          <Link to="/collections" className="featured__view-all">
            View Full Catalogue <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

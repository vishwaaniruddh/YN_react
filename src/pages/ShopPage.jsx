import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import StarburstBadge from '../components/StarburstBadge';
import './ShopPage.css';

function formatPrice(price) {
  if (!price) return '';
  return '₹' + Number(price).toLocaleString('en-IN');
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const cacheKeyProducts = searchQuery ? `shop_products_search_${searchQuery}` : 'shop_products';
  const cacheKeyPage = searchQuery ? `shop_page_search_${searchQuery}` : 'shop_page';
  const cacheKeyPagination = searchQuery ? `shop_pagination_search_${searchQuery}` : 'shop_pagination';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(products.length === 0);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const lastFetchedPage = useRef(products.length > 0 ? page : 0);

  // Keep track of previous search to trigger resets
  const prevSearchRef = useRef(searchQuery);

  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    // If search changed, reset page to 1
    if (prevSearchRef.current !== searchQuery) {
      setPage(1);
      setProducts([]);
      lastFetchedPage.current = 0;
      prevSearchRef.current = searchQuery;
    }

    if (page === lastFetchedPage.current) return;
    
    setLoading(true);
    let url = `${API_BASE_URL}/products.php?page=${page}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (page === 1) {
            setProducts(data.data || []);
          } else {
            setProducts(prev => {
              const newIds = new Set((data.data || []).map(p => p.id));
              const filteredPrev = prev.filter(p => !newIds.has(p.id));
              return [...filteredPrev, ...(data.data || [])];
            });
          }
          setPagination(data.pagination);
          lastFetchedPage.current = page;
        }
      })
      .catch(err => console.error("Error fetching products:", err))
      .finally(() => setLoading(false));
  }, [page, searchQuery]);

  useEffect(() => {
    sessionStorage.setItem(cacheKeyProducts, JSON.stringify(products));
    sessionStorage.setItem(cacheKeyPage, page.toString());
    if (pagination) sessionStorage.setItem(cacheKeyPagination, JSON.stringify(pagination));
  }, [products, page, pagination, cacheKeyProducts, cacheKeyPage, cacheKeyPagination]);

  useEffect(() => {
    return () => {
      sessionStorage.setItem('shop_scroll', window.scrollY.toString());
    };
  }, []);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('shop_scroll');
    if (savedScroll && products.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem('shop_scroll');
      }, 100);
    }
  }, [products.length]);

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination && page < pagination.total_pages) {
        setPage(prev => prev + 1);
      }
    }, { rootMargin: "200px" });
    
    if (node) observer.current.observe(node);
  }, [loading, pagination, page]);

  if (loading && products.length === 0) {
    return (
      <div className="shop-page__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Header */}
      <div className="shop-page__header">
        <div className="container">
          <div className="shop-page__breadcrumbs">
            <Link to="/">Home</Link>
            <ChevronRight size={14} />
            <span>Shop All</span>
          </div>
          <h1 className="shop-page__title">All Collections</h1>
          <p className="shop-page__description">
            Explore our complete curation of luxury bridal lehengas, heritage jewellery, and exquisite designer ensembles.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container shop-page__content">
        {products.length === 0 ? (
          <div className="shop-page__no-products">
            <p>No products available right now.</p>
          </div>
        ) : (
          <div className="shop-page__grid">
              {products.map((product, index) => (
                <motion.div
                  ref={index === products.length - 1 ? lastElementRef : null}
                  key={product.id}
                  className="product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="product-card__image-wrapper">
                    <Link to={`/product/${product.slug}`}>
                      <img 
                        src={product.main_image ? getImageUrl(product.main_image) : 'https://placehold.co/600x800/1a1a1a/c8a55c?text=Yosshita+Neha'} 
                        alt={product.name} 
                        className="product-card__image" 
                        onError={(e) => { e.target.src = 'https://placehold.co/600x800/1a1a1a/c8a55c?text=Yosshita+Neha'; }}
                      />
                    </Link>
                    {product.sale_price > 0 && (
                      <StarburstBadge size={54} color="#e52323" />
                    )}
                    <div className="product-card__hover-actions">
                      <button className="product-card__action" aria-label="Quick View">
                        <Eye size={16} />
                      </button>
                      <button 
                        className="product-card__action" 
                        aria-label="Add to Wishlist"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart size={16} fill={isInWishlist(product.id) ? 'var(--deep-bg)' : 'none'} color={isInWishlist(product.id) ? 'var(--gold)' : 'var(--ivory)'} />
                      </button>
                    </div>
                  </div>
                  <div className="product-card__info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="product-card__category">{product.category_name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.sku}</span>
                    </div>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 className="product-card__name">{product.name}</h3>
                    </Link>
                    <div className="product-card__pricing">
                      {product.sale_price > 0 ? (
                        <>
                          <span className="product-card__price">{formatPrice(product.sale_price)}</span>
                          <span className="product-card__original">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span className="product-card__price">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && page > 1 && (
          <div style={{ textAlign: 'center', marginTop: '30px', padding: '20px' }}>
            <div className="spinner" style={{ margin: '0 auto', width: '30px', height: '30px' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

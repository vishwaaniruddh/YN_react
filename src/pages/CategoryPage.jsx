import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import StarburstBadge from '../components/StarburstBadge';
import './CategoryPage.css';

function formatPrice(price) {
  if (!price) return '';
  return '₹' + Number(price).toLocaleString('en-IN');
}

export default function CategoryPage() {
  const { '*' : fullPath } = useParams();
  const slug = fullPath.split('/').pop();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [pagination, setPagination] = useState(null);

  const lastFetchedPage = useRef(0);
  const lastFetchedSlug = useRef('');

  const { toggleWishlist, isInWishlist } = useWishlist();

  // Handle Slug Change & Cache Restore
  useEffect(() => {
    const savedProducts = sessionStorage.getItem('cat_products_' + slug);
    const savedPage = sessionStorage.getItem('cat_page_' + slug);
    const savedPagination = sessionStorage.getItem('cat_pagination_' + slug);
    const savedCategory = sessionStorage.getItem('cat_info_' + slug);
    
    if (savedProducts && savedPage) {
      setProducts(JSON.parse(savedProducts));
      setPage(parseInt(savedPage, 10));
      if (savedPagination) setPagination(JSON.parse(savedPagination));
      if (savedCategory) setCategory(JSON.parse(savedCategory));
      setLoading(false);
    } else {
      setProducts([]);
      setPage(1);
      setPagination(null);
      setCategory(null);
      setLoading(true);
      lastFetchedPage.current = 0;
    }
    lastFetchedSlug.current = slug;
  }, [slug]);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products.php?category_slug=${slug}&page=${page}&sort=${sort}`);
        const data = await res.json();
        
        if (data.success) {
          setCategory(data.category);
          if (page === 1) {
            setProducts(data.data || []);
          } else {
            setProducts(prev => [...prev, ...(data.data || [])]);
          }
          setPagination(data.pagination);
          lastFetchedPage.current = page;
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryAndProducts();
  }, [slug, page, sort]);

  useEffect(() => {
    // Reset products and page when slug OR sort changes
    setProducts([]);
    setPage(1);
    setLoading(true);
    lastFetchedPage.current = 0;
  }, [slug, sort]);

  useEffect(() => {
    if (products.length > 0) {
      sessionStorage.setItem('cat_products_' + slug, JSON.stringify(products));
      sessionStorage.setItem('cat_page_' + slug, page.toString());
      if (pagination) sessionStorage.setItem('cat_pagination_' + slug, JSON.stringify(pagination));
      if (category) sessionStorage.setItem('cat_info_' + slug, JSON.stringify(category));
    }
  }, [products, page, pagination, category, slug]);

  useEffect(() => {
    return () => {
      sessionStorage.setItem('cat_scroll_' + slug, window.scrollY.toString());
    };
  }, [slug]);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem('cat_scroll_' + slug);
    if (savedScroll && products.length > 0) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem('cat_scroll_' + slug);
      }, 100);
    }
  }, [products.length, slug]);

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
      <div className="category-page__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page__empty container">
        <h2>Category Not Found</h2>
        <p>We couldn't find the category you're looking for.</p>
        <Link to="/" className="button">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* Category Header */}
      <div className="category-page__header">
        <div className="container">
          <div className="category-page__breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <span className="current">{category.name.toUpperCase()}</span>
          </div>
          
          <div className="category-page__title-row">
            <div className="category-page__title-left">
              {category.description && (
                <div className="category-page__subtitle">{category.description.toUpperCase()}</div>
              )}
              <h1 className="category-page__title">{category.name}</h1>
            </div>
            
            <div className="category-page__title-right">
              {pagination && (
                <span className="category-page__count">{pagination.total_items} pieces</span>
              )}
              <select 
                className="category-page__sort" 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">NEWEST FIRST</option>
                <option value="price_asc">PRICE: LOW TO HIGH</option>
                <option value="price_desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>
          </div>
          
          {category.related_categories && category.related_categories.length > 0 && (
            <div className="category-page__related-pills">
              {category.related_categories.map(cat => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.slug}`} 
                  className={`category-pill ${cat.id === category.id ? 'category-pill--active' : ''}`}
                >
                  {cat.name.toUpperCase()}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="container category-page__content">
        {products.length === 0 ? (
          <div className="category-page__no-products">
            <p>No products found in this category.</p>
            <Link to="/collections" className="button">Explore All Products</Link>
          </div>
        ) : (
          <div className="category-page__grid">
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

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, ChevronRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL, getImageUrl } from '../config/api';
import StarburstBadge from '../components/StarburstBadge';
import './ProductPage.css';

function formatPrice(price) {
  if (!price) return '';
  return '₹' + Number(price).toLocaleString('en-IN');
}

export default function ProductPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [shared, setShared] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/product.php?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setProduct(data);
          const imgUrl = data.main_image ? getImageUrl(data.main_image) : 'https://placehold.co/600x800/1a1a1a/c8a55c?text=Yosshita+Neha';
          setActiveImage(imgUrl);
        } else if (data.success && data.data) {
          setProduct(data.data);
          const imgUrl = data.data.main_image ? getImageUrl(data.data.main_image) : 'https://placehold.co/600x800/1a1a1a/c8a55c?text=Yosshita+Neha';
          setActiveImage(imgUrl);
        } else {
          setProduct(null);
        }
      })
      .catch(err => console.error("Error fetching product:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    const success = await addToCart(product.id, quantity);
    setIsAddingToCart(false);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at YosshitaNeha`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="product-page__loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-page__empty container">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/collections" className="button">Return to Shop</Link>
      </div>
    );
  }

  let allImages = [];
  if (product.main_image) {
    const mainImgUrl = getImageUrl(product.main_image);
    allImages.push({ thumb: mainImgUrl, full: mainImgUrl });
  }
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      const imgUrl = getImageUrl(img.image_path);
      const thumbUrl = img.thumb_path ? getImageUrl(img.thumb_path) : imgUrl;
      allImages.push({ 
        thumb: thumbUrl || imgUrl, 
        full: imgUrl 
      });
    });
  }

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x800/1a1a1a/c8a55c?text=Yosshita+Neha';
  };

  return (
    <div className="product-page">
      <div className="container">
        
        <div className="product-page__breadcrumbs">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/collections">Shop</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </div>

        <div className="product-page__inner">
          
          {/* Left: Image Gallery */}
          <motion.div 
            className="product-page__gallery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {allImages.length > 1 && (
              <div className="product-page__thumbnails">
                {allImages.map((img, index) => (
                  <button 
                    key={index}
                    className={`product-page__thumbnail-btn ${activeImage === img.full ? 'active' : ''}`}
                    onClick={() => setActiveImage(img.full)}
                  >
                    <img 
                      src={img.thumb} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="product-page__thumbnail"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
            
            <div className="product-page__main-image-container">
              {product.sale_price > 0 && (
                <StarburstBadge size={64} color="#e52323" />
              )}
              <img 
                src={activeImage} 
                alt={product.name} 
                className="product-page__main-image"
                onError={handleImageError}
              />
            </div>
          </motion.div>

          {/* Right: Product Details */}
          <motion.div 
            className="product-page__details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="product-page__header-info">
              {product.category_name && (
                <span className="product-page__category">{product.category_name}</span>
              )}
              <h1 className="product-page__title">{product.name}</h1>
              
              <div className="product-page__pricing">
                {product.sale_price > 0 ? (
                  <>
                    <span className="product-page__price product-page__price--sale">
                      {formatPrice(product.sale_price)}
                    </span>
                    <span className="product-page__original-price">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="product-page__price">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <p className="product-page__tax-note">Inclusive of all taxes</p>
            </div>

            {/* Stock Count Availability Status */}
            {(() => {
              const maxStock = product.stock_qty !== null && product.stock_qty !== undefined ? parseInt(product.stock_qty, 10) : 99;
              const isOutOfStock = maxStock <= 0;
              return (
                <>
                  <div className="product-page__stock-status" style={{ margin: '12px 0 16px 0' }}>
                    {isOutOfStock ? (
                      <span style={{ color: '#ff6b6b', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b6b' }}></span> Out of Stock
                      </span>
                    ) : maxStock <= 5 ? (
                      <span style={{ color: '#ff9f43', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff9f43' }}></span> Only {maxStock} left in stock - order soon!
                      </span>
                    ) : (
                      <span style={{ color: '#2ecc71', fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ecc71' }}></span> In Stock ({maxStock} available)
                      </span>
                    )}
                  </div>

                  {product.sku && (
                    <div className="product-page__sku">
                      <span>SKU:</span> {product.sku}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div className="product-page__quantity-wrapper" style={{ margin: '20px 0 16px 0' }}>
                    <span style={{ color: 'var(--muted-text)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                      Quantity
                    </span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', opacity: isOutOfStock ? 0.5 : 1 }}>
                      <button 
                        type="button" 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                        style={{ background: 'none', border: 'none', color: '#fff', padding: '10px 18px', cursor: isOutOfStock || quantity <= 1 ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 16px', color: 'var(--gold)', fontWeight: 700, fontSize: '16px', minWidth: '40px', textAlign: 'center' }}>
                        {isOutOfStock ? 0 : quantity}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setQuantity(prev => Math.min(maxStock, prev + 1))}
                        disabled={isOutOfStock || quantity >= maxStock}
                        style={{ background: 'none', border: 'none', color: '#fff', padding: '10px 18px', cursor: isOutOfStock || quantity >= maxStock ? 'not-allowed' : 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        +
                      </button>
                    </div>
                    {!isOutOfStock && quantity >= maxStock && (
                      <div style={{ color: '#ff9f43', fontSize: '12px', marginTop: '6px' }}>
                        Maximum stock limit reached ({maxStock} available).
                      </div>
                    )}
                  </div>

                  <div className="product-page__actions">
                    <button 
                      className={`button product-page__add-to-cart ${addedToCart ? 'success' : ''}`}
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || addedToCart || isOutOfStock}
                    >
                      {addedToCart ? <Check size={18} /> : <ShoppingBag size={18} />}
                      <span>{isOutOfStock ? 'Out of Stock' : isAddingToCart ? 'Adding...' : addedToCart ? 'Added!' : 'Add to Cart'}</span>
                    </button>
                    <button 
                      className="button button--outline product-page__wishlist" 
                      aria-label="Add to Wishlist"
                      onClick={() => toggleWishlist(product.id)}
                      style={isInWishlist(product?.id) ? { backgroundColor: 'var(--gold)', color: 'var(--deep-bg)' } : {}}
                    >
                      <Heart size={20} fill={isInWishlist(product?.id) ? 'var(--deep-bg)' : 'none'} />
                    </button>
                    <button 
                      className="button button--outline product-page__share" 
                      aria-label="Share"
                      onClick={handleShare}
                    >
                      {shared ? <Check size={20} /> : <Share2 size={20} />}
                    </button>
                  </div>
                </>
              );
            })()}

          </motion.div>
        </div>

        <div className="product-page__description-block">
          <h3>Description</h3>
          <div className="product-page__description">
            {(() => {
              if (!product.description) return <p>No description available.</p>;
              // Clean literal '\n?', '\r\n', '\n' strings and leading '?' or '•'
              const cleaned = product.description.replace(/\\r\\n|\\n\?|\\n|\\r/g, '\n');
              const lines = cleaned
                .split('\n')
                .map(l => l.trim().replace(/^[\?\•\s]+/, ''))
                .filter(l => l.length > 0);

              if (lines.length === 0) return <p>No description available.</p>;

              return lines.map((line, i) => (
                <p key={i} style={{ marginBottom: '12px', lineHeight: '1.7', color: 'var(--muted-text)' }}>
                  {line}
                </p>
              ));
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}

// src/components/InstagramCTA.jsx — Revamped with real product images
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './InstagramCTA.css';

// Fallback images if API fails
const fallbackImages = [
  '/images/hero-designer-blouse.png',
  '/images/collection-jewellery.png',
  '/images/collection-blouses.png',
  '/images/brand-story-artisan.png',
  '/images/product-necklace-1.png',
  '/images/hero-heritage-jewellery.png',
];

export default function InstagramCTA() {
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products.php?limit=6&sort=popular`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length >= 6) {
          setImages(data.data.map(p => getImageUrl(p.main_image)));
        }
      })
      .catch(() => {/* use fallback */});
  }, []);

  return (
    <section className="insta-cta">
      <div className="insta-cta__grid">
        {images.map((img, i) => (
          <motion.div
            key={i}
            className="insta-cta__item"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" />
            <div className="insta-cta__item-overlay">
              <Heart size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="insta-cta__banner">
        <Heart size={28} strokeWidth={1.5} />
        <div>
          <h3 className="insta-cta__title">Follow Our Journey</h3>
          <p className="insta-cta__handle">@yosshitaneha</p>
        </div>
        <a href="https://instagram.com/yosshitaneha" target="_blank" rel="noopener noreferrer" className="btn-outline">
          Follow Us
        </a>
      </div>
    </section>
  );
}

// src/components/Collections.jsx — Revamped
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Collections.css';

const collections = [
  {
    id: 'designer-blouses',
    title: 'Designer Blouses',
    subtitle: 'Handcrafted Luxury',
    description: 'Zardozi, mirror-work & bespoke silhouettes',
    image: '/images/collection-blouses.png',
    count: '140+',
    link: '/category/apparel/designer-blouses',
    accent: 'var(--gold)',
  },
  {
    id: 'necklace-sets',
    title: 'Necklace Sets',
    subtitle: 'Kundan · Polki · AD',
    description: 'Statement pieces for every celebration',
    image: '/images/collection-jewellery.png',
    count: '530+',
    link: '/category/jewellery/neclace-sets',
    accent: '#E8B4B8',
  },
  {
    id: 'earrings',
    title: 'Earrings',
    subtitle: 'Antique · Diamond · Vilandi',
    description: 'Jhumkas, chandbalis & contemporary designs',
    image: '/images/product-jewellery-2.png',
    count: '350+',
    link: '/category/jewellery/earrings',
    accent: '#B4D4E8',
  },
  {
    id: 'customisation',
    title: 'Bespoke Studio',
    subtitle: 'Your Vision, Our Craft',
    description: 'Custom blouses & personalised jewellery',
    image: '/images/collection-customisation.png',
    count: '∞',
    link: '/contact',
    accent: '#C8A55C',
  },
];

export default function Collections() {
  return (
    <section className="collections" id="collections">
      <div className="container">
        <div className="collections__header">
          <div>
            <p className="section-label">Shop by Category</p>
            <h2 className="section-title">Our Curated World</h2>
            <p className="section-subtitle">
              From designer blouses to heritage jewellery — explore collections crafted with passion and precision.
            </p>
          </div>
          <Link to="/collections" className="btn-outline collections__view-all">
            View All <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="collections__grid">
          {collections.map((col, i) => (
            <motion.div
              key={col.id}
              className={`collection-card ${i === 0 ? 'collection-card--featured' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link to={col.link} className="collection-card__link">
                <div className="collection-card__image-wrapper">
                  <img src={col.image} alt={col.title} className="collection-card__image" />
                  <div className="collection-card__overlay" />
                </div>
                <div className="collection-card__content">
                  <span className="collection-card__count">{col.count} Pieces</span>
                  <h3 className="collection-card__title">{col.title}</h3>
                  <p className="collection-card__subtitle">{col.subtitle}</p>
                  <p className="collection-card__description">{col.description}</p>
                  <span className="collection-card__arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

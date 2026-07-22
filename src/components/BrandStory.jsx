// src/components/BrandStory.jsx — Revamped
import { motion } from 'framer-motion';
import { ArrowRight, Gem, Scissors, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './BrandStory.css';

const stats = [
  { icon: <Gem size={20} />, value: '2,300+', label: 'Curated Pieces' },
  { icon: <Scissors size={20} />, value: 'Bespoke', label: 'Custom Studio' },
  { icon: <Sparkles size={20} />, value: '100%', label: 'Artisan Made' },
];

export default function BrandStory() {
  return (
    <section className="brand-story">
      <div className="container">
        <div className="brand-story__grid">
          <motion.div
            className="brand-story__text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label">Our Heritage</p>
            <h2 className="brand-story__title">
              Where Artistry Meets<br /><em>Your Celebration</em>
            </h2>
            <div className="gold-divider" />
            <p className="brand-story__text-body">
              At YosshitaNeha, we believe every piece of jewellery and every designer blouse should feel deeply personal. Our atelier combines centuries-old Indian craftsmanship with contemporary design, creating pieces that are not just worn — they are felt.
            </p>
            <p className="brand-story__text-body">
              Each designer blouse is hand-embroidered by master artisans. Every kundan stone is carefully set, every zardozi thread meticulously placed. Our bespoke customisation studio lets you collaborate directly with our couturiers to bring your vision to life.
            </p>

            <div className="brand-story__stats">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="brand-story__stat"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <span className="brand-story__stat-icon">{stat.icon}</span>
                  <span className="brand-story__stat-value">{stat.value}</span>
                  <span className="brand-story__stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/about" className="btn-primary brand-story__cta">
              Discover Our Story <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            className="brand-story__image-col"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="brand-story__image-wrapper">
              <img src="/images/brand-story-artisan.png" alt="Master artisan at YosshitaNeha" className="brand-story__image" />
              <div className="brand-story__image-border" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

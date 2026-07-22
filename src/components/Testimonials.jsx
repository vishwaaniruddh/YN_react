// src/components/Testimonials.jsx — Revamped
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'New Delhi',
    text: 'The designer blouse I ordered was absolute perfection — the zardozi work was exquisite, and the custom fit made all the difference. YosshitaNeha truly understands bespoke luxury.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Ananya Kapoor',
    location: 'Mumbai',
    text: 'Their kundan necklace set was beyond stunning. Every stone was perfectly placed. The craftsmanship is exceptional — it felt like wearing a piece of living heritage.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Meera Reddy',
    location: 'Hyderabad',
    text: 'The customisation experience was incredible. From fabric selection to the final fitting, the team brought my vision to life. My designer blouse and matching jewellery set were perfect for my reception.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Isha Patel',
    location: 'Ahmedabad',
    text: 'I ordered a set of American Diamond earrings and they arrived beautifully packaged. The quality at this price point is unmatched. Already planning my next purchase!',
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(c => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials__header">
          <p className="section-label">Testimonials</p>
          <h2 className="section-title">Loved by Our Clients</h2>
        </div>

        <div className="testimonials__carousel">
          <Quote size={48} className="testimonials__quote-icon" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="testimonials__content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="testimonials__stars">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>

              <p className="testimonials__text">"{t.text}"</p>

              <div className="testimonials__author">
                <div className="testimonials__avatar">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <span className="testimonials__name">{t.name}</span>
                  <span className="testimonials__location">{t.location}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="testimonials__nav">
            <button onClick={prev} aria-label="Previous testimonial">
              <ChevronLeft size={20} />
            </button>
            <div className="testimonials__dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonials__dot ${i === current ? 'testimonials__dot--active' : ''}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} aria-label="Next testimonial">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

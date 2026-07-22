import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Hero.css';

const slides = [
  {
    id: 1,
    subtitle: "Designer Blouses",
    title: "Bespoke Blouses,\nCrafted to Perfection",
    description: "Exquisite handcrafted designer blouses featuring intricate zardozi, mirror work, and heritage embroidery — tailored to your unique silhouette.",
    image: "/images/hero-designer-blouse.png",
    link: "/category/apparel/designer-blouses",
    cta: "Shop Blouses"
  },
  {
    id: 2,
    subtitle: "Heritage Jewellery",
    title: "Adorned with\nTimeless Grace",
    description: "Over 700+ curated Kundan, Polki, Antique, and American Diamond sets — each piece a testament to generations of master craftsmanship.",
    image: "/images/hero-heritage-jewellery.png",
    link: "/category/jewellery",
    cta: "Explore Jewellery"
  },
  {
    id: 3,
    subtitle: "Customisation Studio",
    title: "Your Vision,\nOur Artistry",
    description: "From concept to creation — collaborate with our couturiers to design one-of-a-kind blouses and jewellery ensembles, personalised for your celebration.",
    image: "/images/hero-customisation.png",
    link: "/contact",
    cta: "Start Designing"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="hero">
      {/* Full-screen Background Image */}
      <div className="hero__bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero__bg-image-wrapper"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="hero__bg-image"
            />
          </motion.div>
        </AnimatePresence>
        <div className="hero__bg-overlay" />
      </div>

      {/* Content Overlay */}
      <div className="hero__content container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero__text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <motion.span
              className="hero__label"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Sparkles size={14} />
              {slide.subtitle}
            </motion.span>

            <h1 className="hero__title">
              {slide.title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < slide.title.split('\n').length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="hero__description">{slide.description}</p>

            <div className="hero__actions">
              <Link to={slide.link} className="hero__cta-primary">
                <span>{slide.cta}</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/collections" className="hero__cta-secondary">
                View All Collections
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="hero__indicators">
          {slides.map((s, index) => (
            <button
              key={s.id}
              className={`hero__indicator ${index === currentSlide ? 'hero__indicator--active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to ${s.subtitle}`}
            >
              <span className="hero__indicator-label">{s.subtitle}</span>
              <span className="hero__indicator-bar">
                <span
                  className="hero__indicator-fill"
                  style={index === currentSlide ? { animation: 'indicator-fill 6s linear forwards' } : {}}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

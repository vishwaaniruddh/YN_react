import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, RefreshCcw, Scissors, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero__bg"></div>
        <div className="about-hero__overlay"></div>
        <motion.div 
          className="container about-hero__content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <span className="about-hero__subtitle">Yosshita Neha</span>
          <h1 className="about-hero__title">
            Timeless Elegance: Premium Bridal Attire and Jewelry for Every Bride’s Dream Wedding
          </h1>
          <p className="about-hero__text">
            Where timeless beauty meets modern design, offering brides exquisite dresses and sparkling jewelry for a truly unforgettable wedding celebration.
          </p>
        </motion.div>
      </section>

      {/* Philosophy Section */}
      <section className="about-philosophy section-padding">
        <div className="container">
          <motion.div 
            className="about-philosophy__grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="about-philosophy__text" variants={fadeInUp}>
              <h2>For the bride who dreams of perfection</h2>
              <p>
                Our boutique offers stunning gowns and jewelry to make your wedding day shine with the new fashion trends. We weave the cloth, make up the patterns and bring the final product to life with meticulous attention to detail.
              </p>
              <div className="about-philosophy__stats">
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Eco-Friendly</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">Premium</span>
                  <span className="stat-label">Quality Materials</span>
                </div>
              </div>
            </motion.div>
            <motion.div className="about-philosophy__image-wrapper" variants={fadeInUp}>
              <div className="about-philosophy__image">
                <img src="https://yosshitaneha.com/wp-content/uploads/2024/05/m1.webp" alt="Eco friendly fashion" />
              </div>
              <div className="about-philosophy__badge">
                <Leaf size={24} />
                <span>Sustainable Supply Chain</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about-services section-padding">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="section-subtitle">Our Expertise</span>
            <h2>What We Do</h2>
          </motion.div>

          <motion.div 
            className="about-services__grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {/* Recreate */}
            <motion.div className="service-card" variants={fadeInUp}>
              <div className="service-card__icon">
                <RefreshCcw size={32} />
              </div>
              <h3>We Recreate</h3>
              <p>Your precious old fabrics & sarees can now get a makeover. YN recreates from your existing fabrics and gives it a trendy new look, preserving memories while embracing the future.</p>
            </motion.div>

            {/* Sell */}
            <motion.div className="service-card" variants={fadeInUp}>
              <div className="service-card__icon">
                <ShoppingBag size={32} />
              </div>
              <h3>We Sell</h3>
              <p>We offer a plethora of breathtaking ready to wear apparel and jewellery so that you can deck yourself out to your heart’s desire and really personalise your look for any occasion.</p>
            </motion.div>

            {/* Custom Design */}
            <motion.div className="service-card" variants={fadeInUp}>
              <div className="service-card__icon">
                <Scissors size={32} />
              </div>
              <h3>We Custom Design</h3>
              <p>Our USP lies in customization since well-fit clothes are always in fashion. Come indulge in fashion and get your outfits tailored to perfection. We design for men, women & kids.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Eco & Quality Section */}
      <section className="about-eco section-padding">
        <div className="container">
          <motion.div 
            className="about-eco__content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div className="about-eco__header text-center" variants={fadeInUp}>
              <h2>We design clothes that we want to wear ourselves</h2>
              <p className="about-eco__lead">
                Aliquam tincidunt augue sit amet sapien placerat, pretium luctus arcu blandit. Fusce commodo diam mauris, vel finibus purus porta gravida. Mauris sollicitudin ipsum ac vehicula ultricies.
              </p>
            </motion.div>

            <div className="about-eco__features">
              <motion.div className="eco-feature" variants={fadeInUp}>
                <div className="eco-feature__content">
                  <h3>100% ECO</h3>
                  <p>We use eco-friendly materials, sustainable fabrics, recycled material. We, in partnership with the Green Fashion initiative from the Department of Design and Fashion Technology, care for the environment at every stage of production.</p>
                </div>
              </motion.div>

              <motion.div className="eco-feature" variants={fadeInUp}>
                <div className="eco-feature__content">
                  <h3>Best Quality Materials</h3>
                  <p>We place emphasis on the fact that the clothes last for years. We choose the best quality materials. Aliquam tincidunt augue sit amet sapien placerat, pretium luctus arcu blandit. Fusce commodo diam mauris.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta section-padding text-center">
        <div className="container">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2>Ready to find your dream outfit?</h2>
            <p>Explore our exquisite collections and experience the true meaning of timeless elegance.</p>
            <Link to="/collections" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Explore Collections <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

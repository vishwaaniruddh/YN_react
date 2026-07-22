// src/components/HowItWorks.jsx — Revamped
import { motion } from 'framer-motion';
import { Search, Palette, Sparkles, PartyPopper } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: <Search size={28} strokeWidth={1.5} />,
    number: '01',
    title: 'Discover',
    description: 'Browse our curated collections of designer blouses, heritage jewellery, and bespoke accessories — all crafted by master artisans.',
  },
  {
    icon: <Palette size={28} strokeWidth={1.5} />,
    number: '02',
    title: 'Customise',
    description: 'Work with our designers to personalise every detail — from fabric and embroidery pattern to stone setting and silhouette.',
  },
  {
    icon: <Sparkles size={28} strokeWidth={1.5} />,
    number: '03',
    title: 'Perfect Fit',
    description: 'Every blouse is tailored to your exact measurements. Every jewellery piece is checked for quality and comfort before delivery.',
  },
  {
    icon: <PartyPopper size={28} strokeWidth={1.5} />,
    number: '04',
    title: 'Celebrate',
    description: 'Step into your special day with confidence, adorned in artistry that celebrates your heritage and personal style.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="container">
        <div className="how-it-works__header">
          <p className="section-label">The Experience</p>
          <h2 className="section-title">Your Journey With Us</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            From first discovery to final celebration — a seamless experience crafted around you.
          </p>
        </div>

        <div className="how-it-works__grid">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="step-card__icon">{step.icon}</div>
              <span className="step-card__number">{step.number}</span>
              <h3 className="step-card__title">{step.title}</h3>
              <p className="step-card__desc">{step.description}</p>
              {i < steps.length - 1 && <div className="step-card__connector" />}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

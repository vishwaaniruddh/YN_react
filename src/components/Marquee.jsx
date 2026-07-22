// src/components/Marquee.jsx — Revamped
import './Marquee.css';

const items = [
  'Designer Blouses',
  'Heritage Jewellery',
  'Bespoke Customisation',
  'Kundan & Polki',
  'Handcrafted Luxury',
  'Artisan Excellence',
  'American Diamond',
  'Custom Tailoring',
];

export default function Marquee() {
  const content = items.map(item => `✦ ${item} `).join('');
  return (
    <section className="marquee-section">
      <div className="marquee-track">
        <span className="marquee-text">{content}</span>
        <span className="marquee-text">{content}</span>
      </div>
    </section>
  );
}

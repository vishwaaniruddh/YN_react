// src/pages/Home.jsx
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Collections from '../components/Collections';
import FeaturedProducts from '../components/FeaturedProducts';
import BrandStory from '../components/BrandStory';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import InstagramCTA from '../components/InstagramCTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Collections />
      <FeaturedProducts />
      <BrandStory />
      <HowItWorks />
      <Testimonials />
      <InstagramCTA />
    </>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero__bg"></div>
        <div className="contact-hero__overlay"></div>
        <motion.div 
          className="container contact-hero__content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <span className="contact-hero__subtitle">Get In Touch</span>
          <h1 className="contact-hero__title">Contact Us</h1>
          <p className="contact-hero__text">
            We would love to hear from you. Whether you have a question about our collections, need assistance with an order, or want to book a private consultation, our team is here to help.
          </p>
        </motion.div>
      </section>

      <section className="contact-content section-padding">
        <div className="container">
          <div className="contact-grid">
            
            {/* Contact Info */}
            <motion.div 
              className="contact-info"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <h2 className="contact-heading">Our Studio</h2>
                <p className="contact-subheading">Visit us to explore our exquisite collections in person.</p>
              </motion.div>

              <motion.div className="info-card" variants={fadeInUp}>
                <div className="info-card__icon"><MapPin size={24} /></div>
                <div className="info-card__text">
                  <h3>Address</h3>
                  <p>104, Shyamkamal Building B/1, Agarwal Market, Near Deenanath Mangeshkar Natya Mandir, Vile Parle East, Mumbai 400057</p>
                </div>
              </motion.div>

              <motion.div className="info-card" variants={fadeInUp}>
                <div className="info-card__icon"><Phone size={24} /></div>
                <div className="info-card__text">
                  <h3>Phone</h3>
                  <p><a href="tel:+919324243011">9324243011</a> / <a href="tel:+917506628663">7506628663</a></p>
                </div>
              </motion.div>

              <motion.div className="info-card" variants={fadeInUp}>
                <div className="info-card__icon"><Mail size={24} /></div>
                <div className="info-card__text">
                  <h3>Email</h3>
                  <p><a href="mailto:yosshita.neha@gmail.com">yosshita.neha@gmail.com</a></p>
                </div>
              </motion.div>

              <motion.div className="info-card" variants={fadeInUp}>
                <div className="info-card__icon"><Clock size={24} /></div>
                <div className="info-card__text">
                  <h3>Hours</h3>
                  <p>Monday - Saturday: 10:30 AM - 8:00 PM</p>
                  <p>Sunday: Closed (Available by appointment)</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              className="contact-form-wrapper"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="contact-heading">Send a Message</h2>
              <p className="contact-subheading">Fill out the form below and we will get back to you shortly.</p>
              
              {submitted && (
                <div className="contact-form__success">
                  Thank you for reaching out! We have received your message and will contact you soon.
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Jane Doe" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jane@example.com" />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="5" placeholder="Your message here..."></textarea>
                </div>

                <button type="submit" className="btn-primary submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : (
                    <>Send Message <Send size={16} style={{ marginLeft: '8px' }} /></>
                  )}
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="contact-map">
        <iframe 
          title="Sri Shringarr Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.024220790899!2d72.846594!3d19.1065799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9b0e118ba8d%3A0xc3c5f1c9c4520979!2sSri%20Shringarr%20Fashion%20Studio!5e0!3m2!1sen!2sin!4v1689255011985!5m2!1sen!2sin" 
          width="100%" 
          height="450" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </div>
  );
}

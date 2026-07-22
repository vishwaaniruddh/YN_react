import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './Chatbot.css';

export default function Chatbot() {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch Backend Config dynamically using API_BASE_URL
  useEffect(() => {
    fetch(`${API_BASE_URL}/chatbot.php?action=config`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.enabled) {
          setEnabled(true);
          setWelcomeMsg(data.welcome_message);
          setMessages([
            { sender: 'bot', text: data.welcome_message }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!enabled) return null; // Zero visual footprint if disabled in admin panel

  // 2. Handle Sending Message
  const handleSend = (textToSend = null, imgToSend = null) => {
    const text = textToSend !== null ? textToSend : inputVal.trim();
    const img = imgToSend !== null ? imgToSend : imagePreview;

    if (!text && !img) return;

    // Append user message
    const newMsgs = [...messages, { sender: 'user', text: text, image: img }];
    setMessages(newMsgs);
    setInputVal('');
    setImagePreview(null);
    setLoading(true);

    const payload = {
      message: text,
      image: img
    };

    fetch(`${API_BASE_URL}/chatbot.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: data.reply,
              products: data.products || []
            }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { sender: 'bot', text: data.message || "I couldn't process that request right now." }
          ]);
        }
      })
      .catch(() => {
        setLoading(false);
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: "Sorry, I am having trouble connecting right now." }
        ]);
      });
  };

  // 3. Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button className="chatbot-trigger-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Open AI Assistant">
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-headset'}`} style={{ fontSize: '22px' }}></i>
      </button>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="chatbot-drawer">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <i className="fa-solid fa-gem"></i>
              </div>
              <div>
                <h4 className="chatbot-title">YosshitaNeha Assistant</h4>
                <div className="chatbot-status">
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71' }}></span>
                  Online • AI Stylist
                </div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Messages List */}
          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-msg ${m.sender}`}>
                <div className="chat-msg-bubble">
                  {m.text}
                  {m.image && <img src={m.image} alt="Uploaded outfit" className="chat-msg-img" />}
                </div>

                {/* Product Recommendations Carousel */}
                {m.products && m.products.length > 0 && (
                  <div className="chat-products-scroll">
                    {m.products.map((p) => (
                      <a key={p.id} href={`/product/${p.slug}`} className="chat-product-card">
                        <img src={getImageUrl(p.main_image) || 'https://placehold.co/120x150/141414/C8A55C?text=YN'} alt={p.name} className="chat-product-img" />
                        <div className="chat-product-title">{p.name}</div>
                        <div className="chat-product-price">₹{Number(p.sale_price || p.price).toLocaleString('en-IN')}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg bot">
                <div className="chat-msg-bubble" style={{ color: '#a1a1aa' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="chatbot-chips">
            <button className="chat-chip" onClick={() => handleSend("Show me designer blouses")}>✨ Designer Blouses</button>
            <button className="chat-chip" onClick={() => handleSend("Recommend heritage jewellery")}>💎 Heritage Jewellery</button>
            <button className="chat-chip" onClick={() => handleSend("Track my order")}>📦 Track Order</button>
          </div>

          {/* Image Preview Bar if image attached */}
          {imagePreview && (
            <div style={{ background: '#181818', padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(200, 165, 92, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c8a55c' }}>
                <i className="fa-solid fa-image"></i> Image Attached
              </div>
              <button onClick={() => setImagePreview(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>&times;</button>
            </div>
          )}

          {/* Input Bar */}
          <div className="chatbot-input-bar">
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            <button className="chatbot-icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload Outfit Photo for Visual Matching">
              <i className="fa-solid fa-camera"></i>
            </button>

            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask styling advice or track order..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button className="chatbot-send-btn" onClick={() => handleSend()}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

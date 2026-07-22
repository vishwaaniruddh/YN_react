import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Bot, Sparkles, Gem, Package, Camera, Send, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import './Chatbot.css';

export default function Chatbot() {
  const [enabled, setEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(() => {
    return sessionStorage.getItem('yn_chatbot_open') === 'true';
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('yn_chatbot_messages');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [inputVal, setInputVal] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Fetch Backend Config dynamically
  useEffect(() => {
    fetch(`${API_BASE_URL}/chatbot.php?action=config`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.enabled) {
          setEnabled(true);
          setMessages(prev => {
            if (prev.length === 0) {
              const initial = [{ sender: 'bot', text: data.welcome_message }];
              sessionStorage.setItem('yn_chatbot_messages', JSON.stringify(initial));
              return initial;
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleOpen = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    sessionStorage.setItem('yn_chatbot_open', nextState ? 'true' : 'false');
  };

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('yn_chatbot_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!enabled) return null; // Zero visual footprint if disabled in admin panel

  // 2. Handle Sending Message
  const handleSend = (textToSend = null, imgToSend = null) => {
    const text = textToSend !== null ? textToSend : inputVal.trim();
    const img = imgToSend !== null ? imgToSend : imagePreview;

    if (!text && !img) return;

    const updatedMsgs = [...messages, { sender: 'user', text: text, image: img }];
    setMessages(updatedMsgs);
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
      {/* Floating Trigger Button (Hidden when drawer is open to prevent overlapping text input) */}
      {!isOpen && (
        <button className="chatbot-trigger-btn" onClick={toggleOpen} aria-label="Open AI Assistant">
          <MessageSquare size={24} color="#000" />
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="chatbot-drawer">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={20} color="#c8a55c" />
              </div>
              <div>
                <h4 className="chatbot-title">YosshitaNeha Assistant</h4>
                <div className="chatbot-status">
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#2ecc71' }}></span>
                  Online • AI Stylist
                </div>
              </div>
            </div>
            <button className="chatbot-close-btn" onClick={toggleOpen} aria-label="Close Chat">
              <X size={18} />
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
                <div className="chat-msg-bubble" style={{ color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="animate-spin" /> AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          <div className="chatbot-chips">
            <button className="chat-chip" onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(200, 165, 92, 0.25)', borderColor: '#c8a55c', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={13} /> Upload Outfit Photo
            </button>
            <button className="chat-chip" onClick={() => handleSend("Show me designer blouses")} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} /> Designer Blouses
            </button>
            <button className="chat-chip" onClick={() => handleSend("Recommend heritage jewellery")} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Gem size={13} /> Heritage Jewellery
            </button>
            <button className="chat-chip" onClick={() => handleSend("Track my order")} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Package size={13} /> Track Order
            </button>
          </div>

          {/* Image Preview Bar if image attached */}
          {imagePreview && (
            <div style={{ background: '#181818', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(200, 165, 92, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c8a55c', fontWeight: '600' }}>
                <ImageIcon size={14} /> Outfit Photo Attached
              </div>
              <button onClick={() => setImagePreview(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="chatbot-input-bar">
            {/* Hidden File Input */}
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            
            <button 
              className="chatbot-icon-btn" 
              onClick={() => fileInputRef.current?.click()} 
              title="Upload Outfit Photo for Visual Matching"
            >
              <Camera size={16} color="#c8a55c" />
            </button>

            <input
              type="text"
              className="chatbot-input"
              autoFocus
              placeholder={imagePreview ? "Add note (optional) & press send..." : "Ask styling advice or track order..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button className="chatbot-send-btn" onClick={() => handleSend()} title="Send Message">
              <Send size={15} color="#000" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
